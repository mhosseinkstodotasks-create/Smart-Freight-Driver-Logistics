import { FormatConfig, ExtractedData } from '../types';
import { toEnglishDigits } from './persian';

export const defaultFormatConfig: FormatConfig = {
  national_id: {
    enabled: true,
    required: true,
    strictChecksum: true,
    pattern: '^\\d{10}$',
    errorMessage: 'کد ملی راننده نامعتبر است (باید دقیقاً ۱۰ رقم با محاسبه چک‌سام معتبر ثبت احوال باشد).',
  },
  license_plate: {
    enabled: true,
    required: true,
    requireCommercialLetter: false, // allows any valid transport letter
    pattern: '^(\\d{2,3})\\s*([الف-ی])\\s*(\\d{2,3})(?:\\s*ایران\\s*(\\d{2}))?$',
    errorMessage: 'پلاک انتظامی خودرو در قالب استاندارد نیست (الگوی معتبر: مانند ۱۵۴ ع ۱۶ ایران ۴۳).',
  },
  smart_fleet_number: {
    enabled: true,
    required: false,
    minDigits: 5,
    maxDigits: 9,
    errorMessage: 'شماره هوشمند راننده یا ناوگان باید بین ۵ الی ۹ رقم عددی باشد.',
  },
  mobile_number: {
    enabled: true,
    required: true,
    pattern: '^09\\d{9}$',
    errorMessage: 'شماره تلفن راننده نامعتبر است (باید ۱۱ رقم و با ۰۹ آغاز شود).',
  },
  announcement_number: {
    enabled: true,
    required: true,
    pattern: '^\\d{2,8}$',
    errorMessage: 'شماره اعلام بار یا اعلامیه نامعتبر است (باید عدد مشخص ۲ الی ۸ رقمی باشد).',
  },
  route: {
    enabled: true,
    required: true,
    errorMessage: 'مسیر حمل بار (مبدا بارگیری یا مقصد تخلیه) به درستی در پیام قید نشده است.',
  },
  prices: {
    enabled: true,
    required: false,
    errorMessage: 'مبلغ کرایه صافی یا کل بار مشخص نشده است.',
  },
};

/**
 * Validate Iranian National ID with official modulo-11 checksum algorithm
 */
export function validateNationalIdChecksum(code: string): boolean {
  const clean = toEnglishDigits(code).replace(/\D/g, '');
  if (clean.length !== 10) return false;
  if (/^(\d)\1{9}$/.test(clean)) return false; // Reject all identical digits (0000000000, 1111111111)

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i], 10) * (10 - i);
  }
  const remainder = sum % 11;
  const checkDigit = parseInt(clean[9], 10);

  return remainder < 2 ? checkDigit === remainder : checkDigit === (11 - remainder);
}

/**
 * Validate Iranian License Plate
 */
export function validatePlateFormat(plate: string, requireCommercialLetter = false): boolean {
  if (!plate || !plate.trim()) return false;
  const clean = toEnglishDigits(plate).trim();

  // Pattern matches Persian transport plate formats e.g. "154 ع 16 ایران 43" or "16 ع 154 ایران 43" or "154ع16 ایران 43"
  const regex = /(\d{2,3})\s*([الف-ی])\s*(\d{2,3})(?:\s*ایران\s*(\d{2}))?/;
  const match = clean.match(regex);

  if (!match) return false;

  if (requireCommercialLetter) {
    const letter = match[2];
    if (letter !== 'ع' && letter !== 'ک') return false;
  }

  return true;
}

/**
 * Comprehensive verification of extracted freight data against active acceptable formats
 */
export function validateFreightAgainstRules(
  data: ExtractedData,
  config: FormatConfig = defaultFormatConfig
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // 1. National ID
  if (config.national_id.enabled) {
    const nid = data.driver?.national_id ? toEnglishDigits(data.driver.national_id).replace(/\D/g, '') : '';
    if (!nid) {
      if (config.national_id.required) {
        warnings.push('کد ملی راننده در متن پیام یافت نشد (الزامی است).');
      }
    } else {
      if (nid.length !== 10) {
        warnings.push(`کد ملی ثبت‌شده (${nid}) باید دقیقاً ۱۰ رقم باشد.`);
      } else if (config.national_id.strictChecksum && !validateNationalIdChecksum(nid)) {
        warnings.push(`کد ملی (${nid}) در محاسبات کنترل ثبت‌احوال معتبر نیست (چک‌سام اشتباه است).`);
      }
    }
  }

  // 2. License Plate
  if (config.license_plate.enabled) {
    const plate = data.fleet?.license_plate?.trim();
    if (!plate) {
      if (config.license_plate.required) {
        warnings.push('پلاک انتظامی کامیون/ناوگان یافت نشد (الزامی است).');
      }
    } else {
      if (!validatePlateFormat(plate, config.license_plate.requireCommercialLetter)) {
        warnings.push(`پلاک خودرو (${plate}) با الگوی مجاز پلاک‌های حمل‌ونقل مطابقت ندارد.`);
      }
    }
  }

  // 3. Driver Mobile
  if (config.mobile_number.enabled) {
    const mobile = data.driver?.mobile_number ? toEnglishDigits(data.driver.mobile_number).replace(/\D/g, '') : '';
    if (!mobile) {
      if (config.mobile_number.required) {
        warnings.push('شماره تلفن همراه راننده قید نشده است (الزامی است).');
      }
    } else {
      if (!/^09\d{9}$/.test(mobile)) {
        warnings.push(`شماره همراه (${mobile}) نامعتبر است؛ باید با ۰۹ شروع شده و ۱۱ رقم باشد.`);
      }
    }
  }

  // 4. Smart Fleet / Driver Number
  if (config.smart_fleet_number.enabled) {
    const smart = data.fleet?.smart_fleet_number ? toEnglishDigits(data.fleet.smart_fleet_number).replace(/\D/g, '') : '';
    if (!smart) {
      if (config.smart_fleet_number.required) {
        warnings.push('شماره کارت هوشمند ناوگان قید نشده است.');
      }
    } else {
      if (smart.length < config.smart_fleet_number.minDigits || smart.length > config.smart_fleet_number.maxDigits) {
        warnings.push(`شماره هوشمند (${smart}) باید بین ${config.smart_fleet_number.minDigits} تا ${config.smart_fleet_number.maxDigits} رقم باشد.`);
      }
    }
  }

  // 5. Freight Announcement Number
  if (config.announcement_number.enabled) {
    const ann = data.freight?.announcement_number ? toEnglishDigits(data.freight.announcement_number).replace(/\D/g, '') : '';
    if (!ann) {
      if (config.announcement_number.required) {
        warnings.push('شماره اعلام بار (اعلامیه) یافت نشد (الزامی است).');
      }
    } else {
      if (ann.length < 2 || ann.length > 8) {
        warnings.push(`شماره اعلام بار (${ann}) باید یک عدد بین ۲ تا ۸ رقمی باشد.`);
      }
    }
  }

  // 6. Route (Origin & Destination)
  if (config.route.enabled && config.route.required) {
    const origin = data.freight?.origin?.trim();
    const dest = data.freight?.destination?.trim();
    if (!origin && !dest) {
      warnings.push('مبدا و مقصد بارگیری/تخلیه در پیام مشخص نشده است.');
    } else if (!origin) {
      warnings.push('مبدا بارگیری مشخص نشده است.');
    } else if (!dest) {
      warnings.push('مقصد تخلیه بار مشخص نشده است.');
    }
  }

  // 7. Driver Name
  if (!data.driver?.full_name || data.driver.full_name.trim().length < 3) {
    warnings.push('نام و نام‌خانوادگی راننده در متن پیام مشخص نیست.');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
