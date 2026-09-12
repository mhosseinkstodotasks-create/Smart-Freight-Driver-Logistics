<?php
/**
 * Iranian Freight & Identity Validation Service
 * 
 * Handles Persian numeral conversion, Iranian National ID validation,
 * Iranian mobile phone normalization, and license plate formatting.
 */

class ValidationService {
    /**
     * Convert Persian and Arabic numbers to standard English digits
     */
    public static function toEnglishDigits(?string $input): string {
        if ($input === null) return '';
        $persian = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        $arabic  = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
        $english = ['0','1','2','3','4','5','6','7','8','9'];

        $str = str_replace($persian, $english, $input);
        return str_replace($arabic, $english, $str);
    }

    /**
     * Validate Iranian National ID (کد ملی 10 رقمی با الگوریتم کنترل رقم دهم)
     */
    public static function isValidNationalId(?string $nid): bool {
        if (empty($nid)) return false;
        $nid = self::toEnglishDigits($nid);
        $nid = preg_replace('/[^\d]/', '', $nid);

        if (strlen($nid) !== 10) return false;

        // Check for all identical digits (e.g. 1111111111, which are invalid)
        if (preg_match('/^(\d)\1{9}$/', $nid)) return false;

        $check = (int)$nid[9];
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += ((int)$nid[$i]) * (10 - $i);
        }

        $rem = $sum % 11;
        return ($rem < 2 && $check === $rem) || ($rem >= 2 && $check === (11 - $rem));
    }

    /**
     * Normalize Iranian Mobile Phone Number (09xxxxxxxxx)
     */
    public static function normalizeMobile(?string $phone): ?string {
        if (empty($phone)) return null;
        $clean = self::toEnglishDigits($phone);
        $clean = preg_replace('/[^\d]/', '', $clean);

        // Strip international prefix e.g. 0098 or 98
        if (str_starts_with($clean, '0098')) {
            $clean = '0' . substr($clean, 4);
        } elseif (str_starts_with($clean, '98') && strlen($clean) === 12) {
            $clean = '0' . substr($clean, 2);
        }

        if (strlen($clean) === 10 && str_starts_with($clean, '9')) {
            $clean = '0' . $clean;
        }

        if (preg_match('/^09\d{9}$/', $clean)) {
            return $clean;
        }

        return $clean; // return cleaned even if non-standard
    }

    /**
     * Clean and format Iranian License Plate
     * Example input: "154ع16 ایران 43" or "16 ع 154 ایران 43"
     */
    public static function formatLicensePlate(?string $plate): ?string {
        if (empty($plate)) return null;
        $plate = self::toEnglishDigits($plate);
        return trim(preg_replace('/\s+/', ' ', $plate));
    }
}
