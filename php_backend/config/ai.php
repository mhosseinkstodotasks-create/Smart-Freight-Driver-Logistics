<?php
/**
 * AI Service Configuration (OpenAI ChatGPT & Gemini fallback)
 */

return [
    'provider' => getenv('AI_PROVIDER') ?: 'openai', // 'openai' or 'gemini'
    
    // OpenAI Configuration
    'openai' => [
        'api_key'    => getenv('OPENAI_API_KEY') ?: '',
        'model'      => getenv('OPENAI_MODEL') ?: 'gpt-4o-mini',
        'endpoint'   => 'https://api.openai.com/v1/chat/completions',
        'temperature'=> 0.1,
        'max_tokens' => 1200,
        'timeout'    => 30, // seconds
    ],

    // Gemini API Configuration (Alternative / Fallback)
    'gemini' => [
        'api_key'    => getenv('GEMINI_API_KEY') ?: '',
        'model'      => 'gemini-3.8-flash',
        'endpoint'   => 'https://generativelanguage.googleapis.com/v1beta/models/',
        'timeout'    => 30,
    ],

    // System Prompt for Iranian Freight Extraction
    'system_prompt' => <<<PROMPT
You are an expert Iranian freight & logistics data extraction engine.
You receive raw Persian messages sent by freight dispatchers, drivers, or company operators (Telegram/WhatsApp/SMS format).

CRITICAL RULES:
1. NEVER invent or hallucinate data. If a field is not present in the message, output null.
2. Convert all Persian/Arabic numbers (۰-۹) to standard English digits (0-9).
3. Handle Iranian National IDs (10 digits).
4. Handle Iranian Mobile Numbers (starts with 09 or 989, 11 digits: 09xxxxxxxxx).
5. Extract Iranian vehicle license plates cleanly (e.g. "154ع16 ایران 43" or "16 ع 154 ایران 43").
6. Extract smart fleet number (شماره هوشمند کامیون/راننده).
7. Extract freight announcement details: announcement number, origin, destination, customer/reference (حواله), cargo type, weight, net fare (صافی), total fare (کل), commission (کمیسیون), vehicle order (ماشین چندم).
8. Return strictly valid JSON adhering to the specified schema.
PROMPT
];
