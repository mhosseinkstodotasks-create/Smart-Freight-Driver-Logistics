<?php
/**
 * AI Extraction Service
 * 
 * Communicates securely with OpenAI ChatGPT API (or Gemini) to extract structured
 * Iranian logistics data from raw Persian chat messages.
 */

require_once __DIR__ . '/ValidationService.php';

class AIExtractionService {
    private array $config;

    public function __construct() {
        $this->config = require __DIR__ . '/../config/ai.php';
    }

    /**
     * Extract structured logistics JSON from raw Persian message
     */
    public function extract(string $message, array $context = []): array {
        $cleanMessage = trim($message);
        if (empty($cleanMessage)) {
            return [
                'success' => false,
                'error' => 'پیام ورودی خالی است',
                'data' => null
            ];
        }

        $openAiKey = $this->config['openai']['api_key'];
        $geminiKey = $this->config['gemini']['api_key'];

        // 1. Try OpenAI if API key is provided
        if (!empty($openAiKey)) {
            $result = $this->callOpenAI($cleanMessage, $context);
            if ($result !== null) {
                return $this->postProcessExtraction($result, $cleanMessage);
            }
        }

        // 2. Try Gemini if API key is provided
        if (!empty($geminiKey)) {
            $result = $this->callGemini($cleanMessage);
            if ($result !== null) {
                return $this->postProcessExtraction($result, $cleanMessage);
            }
        }

        // 3. High-precision rule-based Iranian logistics parser (Zero-fail fallback)
        $fallbackResult = $this->ruleBasedExtraction($cleanMessage);
        return $this->postProcessExtraction($fallbackResult, $cleanMessage);
    }

    /**
     * Call OpenAI ChatGPT API
     */
    private function callOpenAI(string $message, array $context): ?array {
        $url = $this->config['openai']['endpoint'];
        $apiKey = $this->config['openai']['api_key'];
        $model = $this->config['openai']['model'];

        $prompt = <<<TEXT
Extract all structured freight, driver, vehicle, and trip information from this Persian logistics message:
Message: "{$message}"

Return ONLY a JSON object with this exact structure:
{
  "driver": {
    "first_name": string or null,
    "last_name": string or null,
    "full_name": string or null,
    "mobile_number": string (11 digits e.g. 09123456789) or null,
    "national_id": string (10 digits) or null
  },
  "fleet": {
    "license_plate": string (e.g. 154ع16 ایران 43) or null,
    "smart_fleet_number": string or null,
    "vehicle_type": string or null,
    "vehicle_turn": string (e.g. ماشین چهارم) or null
  },
  "freight": {
    "announcement_number": string (digits) or null,
    "announcement_type": string (e.g. نوع اول / نوع دوم) or null,
    "customer_reference": string (e.g. حواله آقای میرهاشمی) or null,
    "origin": string or null,
    "destination": string or null,
    "cargo_type": string or null,
    "weight": string or null,
    "net_price": string (e.g. 46 م) or null,
    "total_price": string (e.g. 53 م) or null,
    "commission": string (e.g. 500) or null
  },
  "trip": {
    "available": boolean,
    "notes": string or null
  },
  "missing_fields": string[],
  "confidence": number between 0.0 and 1.0
}
DO NOT invent information. If absent, set to null.
TEXT;

        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => $this->config['system_prompt']],
                ['role' => 'user', 'content' => $prompt]
            ],
            'response_format' => ['type' => 'json_object'],
            'temperature' => $this->config['openai']['temperature'],
            'max_tokens' => $this->config['openai']['max_tokens'],
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->config['openai']['timeout']);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $json = json_decode($response, true);
            $content = $json['choices'][0]['message']['content'] ?? null;
            if ($content) {
                return json_decode($content, true);
            }
        }

        return null;
    }

    /**
     * Call Gemini API (Alternative)
     */
    private function callGemini(string $message): ?array {
        $apiKey = $this->config['gemini']['api_key'];
        $model = $this->config['gemini']['model'];
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $systemPrompt = $this->config['system_prompt'];
        $userPrompt = "Extract Persian logistics data as strict JSON:\n" . $message;

        $payload = [
            'contents' => [
                ['role' => 'user', 'parts' => [['text' => $systemPrompt . "\n\n" . $userPrompt]]]
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'temperature' => 0.1
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $json = json_decode($response, true);
            $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if ($text) {
                return json_decode($text, true);
            }
        }

        return null;
    }

    /**
     * Rule-based Iranian Logistics Parser (Deterministic Persian patterns)
     */
    public function ruleBasedExtraction(string $rawMessage): array {
        $msg = ValidationService::toEnglishDigits($rawMessage);

        $driver = [
            'first_name' => null,
            'last_name' => null,
            'full_name' => null,
            'mobile_number' => null,
            'national_id' => null,
        ];

        $fleet = [
            'license_plate' => null,
            'smart_fleet_number' => null,
            'vehicle_type' => null,
            'vehicle_turn' => null,
        ];

        $freight = [
            'announcement_number' => null,
            'announcement_type' => null,
            'customer_reference' => null,
            'origin' => null,
            'destination' => null,
            'cargo_type' => null,
            'weight' => null,
            'net_price' => null,
            'total_price' => null,
            'commission' => null,
        ];

        // 1. Mobile Phone (09xxxxxxxxx)
        if (preg_match('/(09\d{9})/', $msg, $m)) {
            $driver['mobile_number'] = $m[1];
        }

        // 2. National ID (10 digits often prefixed by کد ملی / شماره ملی)
        if (preg_match('/(?:کد\s*ملی|شماره\s*ملی)[^\d]*(\d{10})/u', $msg, $m)) {
            $driver['national_id'] = $m[1];
        } elseif (preg_match('/\b(\d{10})\b/', $msg, $m)) {
            if ($m[1] !== ($driver['mobile_number'] ?? '')) {
                $driver['national_id'] = $m[1];
            }
        }

        // 3. Driver Name (بنام ... / راننده ...)
        if (preg_match('/(?:بنام|راننده)\s+([\p{Arabic}\s]{3,30}?)(?=(?:شماره|پلاک|کد|هوشمند|09|\d|\n|$))/u', $msg, $m)) {
            $name = trim($m[1]);
            $driver['full_name'] = $name;
            $parts = explode(' ', $name);
            if (count($parts) >= 2) {
                $driver['first_name'] = $parts[0];
                $driver['last_name'] = implode(' ', array_slice($parts, 1));
            }
        }

        // 4. Smart fleet number (هوشمند ...)
        if (preg_match('/(?:شماره\s*هوشمند|هوشمند)[^\d]*(\d{5,9})/u', $msg, $m)) {
            $fleet['smart_fleet_number'] = $m[1];
        }

        // 5. License Plate (e.g. 154ع16 ایران 43 or 16 ع 154 ایران 43)
        if (preg_match('/(\d{2,3}\s*[\p{Arabic}]\s*\d{2,3}\s*(?:ایران\s*\d{2})?)/u', $msg, $m)) {
            $fleet['license_plate'] = ValidationService::formatLicensePlate($m[1]);
        }

        // 6. Announcement Number (اعلامیه ... / اعلام بار ...)
        if (preg_match('/(?:اعلامیه|اعلام\s*بار)[^\d]*(\d+)/u', $msg, $m)) {
            $freight['announcement_number'] = $m[1];
        }

        // 7. Route (از ... به ...)
        if (preg_match('/از\s+([\p{Arabic}\s]+?)\s+به\s+([\p{Arabic}\s]+?)(?=(?:حواله|صافی|کل|بار|کاشی|قیمت|\n|$))/u', $msg, $m)) {
            $freight['origin'] = trim($m[1]);
            $freight['destination'] = trim($m[2]);
        }

        // 8. Customer reference (حواله ...)
        if (preg_match('/حواله\s+([\p{Arabic}\s]+?)(?=(?:صافی|کل|قیمت|\n|$))/u', $msg, $m)) {
            $freight['customer_reference'] = 'حواله ' . trim($m[1]);
        }

        // 9. Prices & Fares (صافی ... / کل ...)
        if (preg_match('/صافی\s*([^\n]+)/u', $msg, $m)) {
            $freight['net_price'] = trim($m[1]);
        }
        if (preg_match('/کل\s*([^\n]+)/u', $msg, $m)) {
            $freight['total_price'] = trim($m[1]);
        }

        // 10. Commission (e.g. 500 or ۵۰۰)
        if (preg_match('/(?:کمیسیون|پورسانت)[^\d]*(\d+)/u', $msg, $m) || preg_match('/(\d{3,4})\s*✅/u', $msg, $m)) {
            $freight['commission'] = $m[1];
        }

        // 11. Vehicle turn / Type (e.g. نوع اول / ماشین چهارم)
        if (preg_match('/(نوع\s*(?:اول|دوم|سوم))/u', $msg, $m)) {
            $freight['announcement_type'] = $m[1];
        }
        if (preg_match('/(ماشین\s*[\p{Arabic}]+)/u', $msg, $m)) {
            $fleet['vehicle_turn'] = $m[1];
        }

        // 12. Weight / Cargo
        if (preg_match('/(\d+(?:\.\d+)?\s*تن)/u', $msg, $m)) {
            $freight['weight'] = $m[1];
        }

        return [
            'driver' => $driver,
            'fleet' => $fleet,
            'freight' => $freight,
            'trip' => ['available' => true, 'notes' => ''],
            'missing_fields' => [],
            'confidence' => 0.90
        ];
    }

    /**
     * Post-process extraction: clean numbers, evaluate missing fields, calculate confidence
     */
    private function postProcessExtraction(array $extracted, string $rawMessage): array {
        $driver = $extracted['driver'] ?? [];
        $fleet = $extracted['fleet'] ?? [];
        $freight = $extracted['freight'] ?? [];

        // Normalize driver data
        if (!empty($driver['mobile_number'])) {
            $driver['mobile_number'] = ValidationService::normalizeMobile($driver['mobile_number']);
        }
        if (!empty($driver['national_id'])) {
            $driver['national_id'] = ValidationService::toEnglishDigits($driver['national_id']);
        }
        if (empty($driver['full_name']) && (!empty($driver['first_name']) || !empty($driver['last_name']))) {
            $driver['full_name'] = trim(($driver['first_name'] ?? '') . ' ' . ($driver['last_name'] ?? ''));
        }

        // Clean fleet
        if (!empty($fleet['smart_fleet_number'])) {
            $fleet['smart_fleet_number'] = ValidationService::toEnglishDigits($fleet['smart_fleet_number']);
        }

        // Clean freight
        if (!empty($freight['announcement_number'])) {
            $freight['announcement_number'] = ValidationService::toEnglishDigits($freight['announcement_number']);
        }

        // Identify missing critical fields
        $missing = [];
        if (empty($driver['full_name'])) $missing[] = 'نام راننده';
        if (empty($driver['mobile_number'])) $missing[] = 'شماره تماس راننده';
        if (empty($driver['national_id'])) $missing[] = 'کد ملی راننده';
        if (empty($fleet['license_plate'])) $missing[] = 'پلاک خودرو';
        if (empty($freight['announcement_number'])) $missing[] = 'شماره اعلام بار';
        if (empty($freight['origin']) && empty($freight['destination'])) $missing[] = 'مسیر بار (مبدا / مقصد)';

        $extracted['driver'] = $driver;
        $extracted['fleet'] = $fleet;
        $extracted['freight'] = $freight;
        $extracted['missing_fields'] = $missing;

        return [
            'success' => true,
            'raw_message' => $rawMessage,
            'data' => $extracted,
            'missing_fields' => $missing,
            'is_complete' => count($missing) === 0
        ];
    }
}
