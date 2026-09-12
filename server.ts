import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-Memory Database Store mimicking MySQL records
let driversStore = [
  { id: 1, first_name: 'اسماعیل', last_name: 'حاتمی', full_name: 'اسماعیل حاتمی', national_id: '4640119402', mobile_number: '09162961902', score: 4.8, created_at: '۱۴۰۵/۰۶/۲۰', trip_count: 14 },
  { id: 2, first_name: 'مسعود', last_name: 'عقراوی', full_name: 'مسعود عقراوی', national_id: '1810567890', mobile_number: '09132668653', score: 5.0, created_at: '۱۴۰۵/۰۶/۲۰', trip_count: 21 },
  { id: 3, first_name: 'علی', last_name: 'اقبالی', full_name: 'علی اقبالی', national_id: '1289654321', mobile_number: '09145769715', score: 4.9, created_at: '۱۴۰۵/۰۶/۲۰', trip_count: 9 },
  { id: 4, first_name: 'شاپور', last_name: 'معبودی', full_name: 'شاپور معبودی', national_id: '1987654320', mobile_number: '09145396757', score: 4.7, created_at: '۱۴۰۵/۰۶/۲۰', trip_count: 32 },
  { id: 5, first_name: 'رحیم', last_name: 'عبدالوند', full_name: 'رحیم عبدالوند', national_id: '2564789123', mobile_number: '09167131483', score: 5.0, created_at: '۱۴۰۵/۰۶/۲۰', trip_count: 18 },
];

let fleetsStore = [
  { id: 1, license_plate: '۱۶ ع ۱۵۴ ایران ۴۳', smart_fleet_number: '4248993', vehicle_type: 'کامیون ده چرخ', vehicle_turn: 'ماشین چهارم', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 2, license_plate: '۱۱ ع ۱۲۵ ایران ۱۳', smart_fleet_number: '3982104', vehicle_type: 'تریلی کفی', vehicle_turn: 'ماشین اول', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 3, license_plate: '۷۳ ع ۲۹۷ ایران ۹۱', smart_fleet_number: '5129482', vehicle_type: 'کامیون تک', vehicle_turn: 'ماشین دوم', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 4, license_plate: '۹۴ ع ۲۳۴ ایران ۹۱', smart_fleet_number: '4876123', vehicle_type: 'تریلی چادری', vehicle_turn: 'ماشین سوم', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 5, license_plate: '۵۹ ع ۵۹۹ ایران ۳۱', smart_fleet_number: '6192834', vehicle_type: 'کامیون جفت', vehicle_turn: 'ماشین اول', created_at: '۱۴۰۵/۰۶/۲۰' },
];

let freightsStore = [
  { id: 1, announcement_number: '249', announcement_type: 'نوع اول', customer_reference: 'حواله آقای میر هاشمی', origin: 'کاشی اصفهان (نجف آباد)', destination: 'گمرک شلمچه', cargo_type: 'پالت کاشی میرجلیلی', weight: '24 تن', net_price: '۴۶ م', total_price: '۵۳ م', commission: '۵۰۰', bill_of_lading_company: 'ایمان بار', agent_name: 'محمدحسین کرم سیچانی', is_unpressed: true, created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 2, announcement_number: '249', announcement_type: 'نوع دوم', customer_reference: 'حواله آقای میر هاشمی', origin: 'نجف آباد', destination: 'گمرک شلمچه', cargo_type: 'پالت کاشی میرجلیلی', weight: '22 تن', net_price: '۴۵ م', total_price: '۵۲ م', commission: '۵۰۰', bill_of_lading_company: 'ایمان بار', agent_name: 'محمدحسین کرم سیچانی', is_unpressed: true, created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 3, announcement_number: '237', announcement_type: 'نوع دوم', customer_reference: 'حافظی پالت کاشی نیلو', origin: 'نجف آباد', destination: 'چذابه', cargo_type: 'پالت کاشی نیلو', weight: '25 تن', net_price: '۴۸ م', total_price: '۵۵ م', commission: '—', bill_of_lading_company: 'ایمان بار', agent_name: 'مژگان مغازه ای', is_unpressed: false, created_at: '۱۴۰۵/۰۶/۲۰' },
];

let tripsStore = [
  { id: 984, trip_number: 'سفر ۹۸۴#', driver_id: 1, fleet_id: 1, freight_id: 1, status: 'لغو سفر', is_unpressed: true, operator_name: 'ناصر کرمی', trip_date: '۱۴۰۵/۰۶/۲۰ ۲۲:۳۶', notes: 'اعلامیه ۲۴۹ نوع اول - ماشین چهارم - بنام اسماعیل حاتمی', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 983, trip_number: 'سفر ۹۸۳#', driver_id: 2, fleet_id: 2, freight_id: 2, status: 'لغو سفر', is_unpressed: true, operator_name: 'ناصر کرمی', trip_date: '۱۴۰۵/۰۶/۲۰ ۲۲:۳۵', notes: 'سفر مسعود عقراوی', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 982, trip_number: 'سفر ۹۸۲#', driver_id: 3, fleet_id: 3, freight_id: 2, status: 'لغو سفر', is_unpressed: true, operator_name: 'ناصر کرمی', trip_date: '۱۴۰۵/۰۶/۲۰ ۲۲:۳۳', notes: 'سفر علی اقبالی', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 981, trip_number: 'سفر ۹۸۱#', driver_id: 4, fleet_id: 4, freight_id: 2, status: 'فعال', is_unpressed: false, operator_name: 'ناصر کرمی', trip_date: '۱۴۰۵/۰۶/۲۰ ۲۲:۳۲', notes: 'سفر شاپور معبودی', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 980, trip_number: 'سفر ۹۸۰#', driver_id: 5, fleet_id: 5, freight_id: 3, status: 'فعال', is_unpressed: false, operator_name: 'مژگان مغازه ای', trip_date: '۱۴۰۵/۰۶/۲۰ ۱۹:۳۸', notes: 'سفر رحیم عبدالوند', created_at: '۱۴۰۵/۰۶/۲۰' },
];

// Helper: Convert Persian/Arabic digits
function toEnglishDigits(str: string): string {
  if (!str) return '';
  const p = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const a = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  let res = str;
  p.forEach((char, i) => { res = res.replace(new RegExp(char, 'g'), String(i)); });
  a.forEach((char, i) => { res = res.replace(new RegExp(char, 'g'), String(i)); });
  return res;
}

// Rule-based fallback extraction
function ruleBasedExtract(rawMessage: string) {
  const msg = toEnglishDigits(rawMessage);

  const driver: any = { first_name: null, last_name: null, full_name: null, mobile_number: null, national_id: null };
  const fleet: any = { license_plate: null, smart_fleet_number: null, vehicle_type: null, vehicle_turn: null };
  const freight: any = { announcement_number: null, announcement_type: null, customer_reference: null, origin: null, destination: null, cargo_type: null, weight: null, net_price: null, total_price: null, commission: null };

  // Mobile
  const phoneMatch = msg.match(/(09\d{9})/);
  if (phoneMatch) driver.mobile_number = phoneMatch[1];

  // National ID
  const nidMatch = msg.match(/(?:کد\s*ملی|شماره\s*ملی)[^\d]*(\d{10})/);
  if (nidMatch) {
    driver.national_id = nidMatch[1];
  } else {
    const rawNid = msg.match(/\b(\d{10})\b/);
    if (rawNid && rawNid[1] !== driver.mobile_number) {
      driver.national_id = rawNid[1];
    }
  }

  // Driver Name
  const nameMatch = msg.match(/(?:بنام|نام\s*راننده|راننده:?)\s+([\u0600-\u06FF\s]{3,30}?)(?=(?:شماره|پلاک|کد|هوشمند|09|\d|\n|$))/);
  if (nameMatch) {
    const name = nameMatch[1].trim();
    driver.full_name = name;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      driver.first_name = parts[0];
      driver.last_name = parts.slice(1).join(' ');
    }
  }

  // Smart Fleet Number
  const smartMatch = msg.match(/(?:شماره\s*هوشمند|هوشمند)[^\d]*(\d{5,9})/);
  if (smartMatch) fleet.smart_fleet_number = smartMatch[1];

  // License plate
  const plateMatch = msg.match(/(\d{2,3}\s*[الف-ی]\s*\d{2,3}(?:\s*ایران\s*\d{2})?)/);
  if (plateMatch) fleet.license_plate = plateMatch[1].trim();

  // Announcement number
  const annMatch = msg.match(/(?:اعلامیه|اعلام\s*بار)[^\d]*(\d+)/);
  if (annMatch) freight.announcement_number = annMatch[1];

  // Route
  const routeMatch = msg.match(/از\s+([\u0600-\u06FF\s]+?)\s+به\s+([\u0600-\u06FF\s]+?)(?=(?:حواله|صافی|کل|بار|کاشی|قیمت|\n|$))/);
  if (routeMatch) {
    freight.origin = routeMatch[1].trim();
    freight.destination = routeMatch[2].trim();
  }

  // Customer reference
  const refMatch = msg.match(/حواله\s+([\u0600-\u06FF\s]+?)(?=(?:صافی|کل|قیمت|\n|$))/);
  if (refMatch) freight.customer_reference = 'حواله ' + refMatch[1].trim();

  // Prices
  const netMatch = msg.match(/صافی\s*([^\n]+)/);
  if (netMatch) freight.net_price = netMatch[1].trim();

  const totalMatch = msg.match(/کل\s*([^\n]+)/);
  if (totalMatch) freight.total_price = totalMatch[1].trim();

  const commMatch = msg.match(/(?:کمیسیون|پورسانت)[^\d]*(\d+)/) || msg.match(/(\d{3,4})\s*✅/);
  if (commMatch) freight.commission = commMatch[1];

  // Vehicle turn / types
  const typeMatch = msg.match(/(نوع\s*(?:اول|دوم|سوم))/);
  if (typeMatch) freight.announcement_type = typeMatch[1];

  const turnMatch = msg.match(/(ماشین\s*[\u0600-\u06FF]+)/);
  if (turnMatch) fleet.vehicle_turn = turnMatch[1];

  const weightMatch = msg.match(/(\d+(?:\.\d+)?\s*تن)/);
  if (weightMatch) freight.weight = weightMatch[1];

  return {
    driver,
    fleet,
    freight,
    trip: { available: true, notes: '' },
    missing_fields: [],
    confidence: 0.92
  };
}

// Check duplicates against active store
function checkDuplicates(extracted: any) {
  const { driver, fleet, freight } = extracted;

  // Driver duplicate
  const cleanNid = driver?.national_id ? toEnglishDigits(driver.national_id).replace(/\D/g, '') : null;
  const cleanPhone = driver?.mobile_number ? toEnglishDigits(driver.mobile_number).replace(/\D/g, '') : null;

  const matchedDriver = driversStore.find(d => 
    (cleanNid && d.national_id === cleanNid) ||
    (cleanPhone && d.mobile_number === cleanPhone)
  );

  // Fleet duplicate
  const cleanPlate = fleet?.license_plate ? toEnglishDigits(fleet.license_plate).replace(/\s+/g, '') : null;
  const cleanSmart = fleet?.smart_fleet_number ? toEnglishDigits(fleet.smart_fleet_number).replace(/\D/g, '') : null;

  const matchedFleet = fleetsStore.find(f =>
    (cleanPlate && toEnglishDigits(f.license_plate).replace(/\s+/g, '') === cleanPlate) ||
    (cleanSmart && f.smart_fleet_number === cleanSmart)
  );

  // Freight duplicate
  const cleanAnnNum = freight?.announcement_number ? toEnglishDigits(freight.announcement_number) : null;
  const matchedFreight = freightsStore.find(fr => cleanAnnNum && fr.announcement_number === cleanAnnNum);

  // Active Trip duplicate
  let existingTrip: any = null;
  if (matchedDriver) {
    existingTrip = tripsStore.find(t => t.driver_id === matchedDriver.id && t.status !== 'لغو سفر') || null;
  }

  return {
    driver: {
      is_duplicate: !!matchedDriver,
      existing_record: matchedDriver || null,
      match_reason: matchedDriver ? `راننده در سیستم موجود است (${matchedDriver.full_name}) - شناسه #${matchedDriver.id}` : null
    },
    fleet: {
      is_duplicate: !!matchedFleet,
      existing_record: matchedFleet || null,
      match_reason: matchedFleet ? `ناوگان در سیستم موجود است (${matchedFleet.license_plate})` : null
    },
    freight: {
      is_duplicate: !!matchedFreight,
      existing_record: matchedFreight || null,
      match_reason: matchedFreight ? `اعلام بار شماره ${cleanAnnNum} قبلاً ثبت شده است` : null
    },
    trip: {
      is_duplicate: !!existingTrip,
      existing_record: existingTrip,
      match_reason: existingTrip ? `سفر فعال با این راننده از قبل ثبت شده است` : null
    }
  };
}

// -------------------------------------------------------------
// FORMAT VALIDATION & ACCEPTABLE FORMATS ENGINE
// -------------------------------------------------------------

function validateNationalIdChecksum(code: string): boolean {
  const clean = toEnglishDigits(code).replace(/\D/g, '');
  if (clean.length !== 10) return false;
  if (/^(\d)\1{9}$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i], 10) * (10 - i);
  }
  const remainder = sum % 11;
  const checkDigit = parseInt(clean[9], 10);
  return remainder < 2 ? checkDigit === remainder : checkDigit === (11 - remainder);
}

function validatePlateFormat(plate: string, requireCommercialLetter = false): boolean {
  if (!plate || !plate.trim()) return false;
  const clean = toEnglishDigits(plate).trim();
  const regex = /(\d{2,3})\s*([الف-ی])\s*(\d{2,3})(?:\s*ایران\s*(\d{2}))?/;
  const match = clean.match(regex);
  if (!match) return false;
  if (requireCommercialLetter) {
    const letter = match[2];
    if (letter !== 'ع' && letter !== 'ک') return false;
  }
  return true;
}

let currentFormatConfig = {
  national_id: {
    enabled: true,
    required: true,
    strictChecksum: true,
    pattern: '^\\d{10}$',
    errorMessage: 'کد ملی راننده نامعتبر است (باید دقیقاً ۱۰ رقم با کنترل چک‌سام معتبر ثبت احوال باشد).'
  },
  license_plate: {
    enabled: true,
    required: true,
    requireCommercialLetter: false,
    pattern: '^(\\d{2,3})\\s*([الف-ی])\\s*(\\d{2,3})(?:\\s*ایران\\s*(\\d{2}))?$',
    errorMessage: 'پلاک خودرو با الگوی استاندارد پلاک ترابری (مانند ۱۵۴ ع ۱۶ ایران ۴۳) همخوانی ندارد.'
  },
  smart_fleet_number: {
    enabled: true,
    required: false,
    minDigits: 5,
    maxDigits: 9,
    errorMessage: 'شماره کارت هوشمند ناوگان/راننده باید بین ۵ تا ۹ رقم عددی باشد.'
  },
  mobile_number: {
    enabled: true,
    required: true,
    pattern: '^09\\d{9}$',
    errorMessage: 'شماره همراه راننده نامعتبر است (باید ۱۱ رقم و با ۰۹ آغاز شود).'
  },
  announcement_number: {
    enabled: true,
    required: true,
    pattern: '^\\d{2,8}$',
    errorMessage: 'شماره اعلام بار یا اعلامیه نامعتبر است (باید عدد معتبر ۲ تا ۸ رقمی باشد).'
  },
  route: {
    enabled: true,
    required: true,
    errorMessage: 'مسیر حمل بار (مبدا بارگیری یا مقصد تخلیه) مشخص نشده است.'
  },
  prices: {
    enabled: true,
    required: false,
    errorMessage: 'مبلغ کرایه صافی یا کل مشخص نشده است.'
  }
};

function validateAgainstRules(data: any, config: typeof currentFormatConfig): { isValid: boolean; warnings: string[] } {
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
        warnings.push(`کد ملی راننده (${nid}) نامعتبر است؛ باید دقیقاً ۱۰ رقم باشد.`);
      } else if (config.national_id.strictChecksum && !validateNationalIdChecksum(nid)) {
        warnings.push(`کد ملی (${nid}) در محاسبات کنترل ثبت‌احوال نامعتبر است (چک‌سام اشتباه است).`);
      }
    }
  }

  // 2. License Plate
  if (config.license_plate.enabled) {
    const plate = data.fleet?.license_plate ? String(data.fleet.license_plate).trim() : '';
    if (!plate) {
      if (config.license_plate.required) {
        warnings.push('پلاک انتظامی کامیون/ناوگان قید نشده است (الزامی است).');
      }
    } else {
      if (!validatePlateFormat(plate, config.license_plate.requireCommercialLetter)) {
        warnings.push(`پلاک خودرو (${plate}) با ساختار استاندارد پلاک ترابری (مانند ۱۵۴ ع ۱۶ ایران ۴۳) مطابقت ندارد.`);
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
        warnings.push(`شماره همراه راننده (${mobile}) نامعتبر است؛ باید با ۰۹ آغاز شده و ۱۱ رقم باشد.`);
      }
    }
  }

  // 4. Smart Fleet Number
  if (config.smart_fleet_number.enabled) {
    const smart = data.fleet?.smart_fleet_number ? toEnglishDigits(data.fleet.smart_fleet_number).replace(/\D/g, '') : '';
    if (!smart) {
      if (config.smart_fleet_number.required) {
        warnings.push('شماره کارت هوشمند ناوگان قید نشده است.');
      }
    } else {
      if (smart.length < config.smart_fleet_number.minDigits || smart.length > config.smart_fleet_number.maxDigits) {
        warnings.push(`شماره کارت هوشمند (${smart}) باید بین ${config.smart_fleet_number.minDigits} تا ${config.smart_fleet_number.maxDigits} رقم باشد.`);
      }
    }
  }

  // 5. Freight Announcement Number
  if (config.announcement_number.enabled) {
    const ann = data.freight?.announcement_number ? toEnglishDigits(data.freight.announcement_number).replace(/\D/g, '') : '';
    if (!ann) {
      if (config.announcement_number.required) {
        warnings.push('شماره اعلام بار یا اعلامیه قید نشده است (الزامی است).');
      }
    } else {
      if (ann.length < 2 || ann.length > 8) {
        warnings.push(`شماره اعلام بار (${ann}) باید عدد بین ۲ تا ۸ رقمی باشد.`);
      }
    }
  }

  // 6. Route
  if (config.route.enabled && config.route.required) {
    const origin = data.freight?.origin?.trim();
    const dest = data.freight?.destination?.trim();
    if (!origin && !dest) {
      warnings.push('مسیر حمل بار (مبدا بارگیری یا مقصد تخلیه) مشخص نشده است.');
    } else if (!origin) {
      warnings.push('مبدا بارگیری بار مشخص نشده است.');
    } else if (!dest) {
      warnings.push('مقصد تخلیه بار مشخص نشده است.');
    }
  }

  // 7. Driver Name
  if (!data.driver?.full_name || data.driver.full_name.trim().length < 3) {
    warnings.push('نام و نام‌خانوادگی راننده در متن پیام مشخص نشده است.');
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}

// -------------------------------------------------------------
// SHARED GROUP CHAT STORE (Seen by all users)
// -------------------------------------------------------------

let groupMessagesStore: any[] = [
  {
    id: 'grp-msg-1',
    sender: 'user',
    user_id: 'op-1',
    user_name: 'ناصر مدیر',
    user_role: 'مدیر ترابری و پایانه',
    avatar_color: '#f59e0b',
    message_type: 'user_freight',
    text: `ناصر مدیر
14050621
اعلامیه ۲۴۹
نوع اول
ماشین چهارم
شماره ملی راننده ۴۶۴۰۱۱۹۴۰۲ بنام اسماعیل حاتمی
شماره کامیون ۱۵۴ع۱۶ ایران ۴۳
شماره هوشمند ۴۲۴۸۹۹۳
09162961902

از کاشی اصفهان به گمرک شلمچه حواله آقای میر هاشمی

صافی ۴۶ م

500 ✅
کل ۵۳ م`,
    timestamp: '۱۰:۲۴'
  },
  {
    id: 'grp-msg-2',
    sender: 'bot',
    message_type: 'bot_approved',
    text: '✅ تاییدیه: اطلاعات اعلام بار تایید شد و با وضعیت «پردازش‌نشده (Unpressed)» در دیتابیس ثبت گردید.',
    timestamp: '۱۰:۲۵',
    approved_info: {
      trip_id: 984,
      trip_number: 'سفر ۹۸۴#',
      is_unpressed: true,
      driver_name: 'اسماعیل حاتمی',
      driver_national_id: '4640119402',
      driver_mobile: '09162961902',
      license_plate: '۱۶ ع ۱۵۴ ایران ۴۳',
      smart_fleet_number: '4248993',
      announcement_number: '249',
      origin: 'کاشی اصفهان (نجف آباد)',
      destination: 'گمرک شلمچه',
      net_price: '۴۶ م',
      total_price: '۵۳ م',
      commission: '۵۰۰',
      timestamp: '۱۰:۲۵'
    }
  },
  {
    id: 'grp-msg-3',
    sender: 'user',
    user_id: 'op-2',
    user_name: 'رضا رضایی',
    user_role: 'متصدی اعلام بار',
    avatar_color: '#3b82f6',
    message_type: 'user_freight',
    text: 'اعلام بار 249 راننده احمد حسینی کد ملی 45892 برای حمل پالت کاشی از نجف آباد به گمرک مهران، پلاک 1234',
    timestamp: '۱۰:۳۱'
  },
  {
    id: 'grp-msg-4',
    sender: 'bot',
    message_type: 'bot_warning',
    text: '⚠️ اخطار: فرمت نامعتبر اطلاعات اعلام بار',
    timestamp: '۱۰:۳۱',
    warning_reasons: [
      'کد ملی راننده (45892) نامعتبر است؛ باید دقیقاً ۱۰ رقم با کنترل چک‌سام معتبر ثبت احوال باشد.',
      'پلاک خودرو (1234) با الگوی استاندارد پلاک ترابری (مانند ۱۵۴ ع ۱۶ ایران ۴۳) همخوانی ندارد.',
      'شماره همراه راننده در پیام قید نشده است (الزامی است).'
    ]
  }
];

// Helper: Save freight registration to database with UNPRESSED flag
function registerFreightToDatabase(extracted: any, operatorName = 'اپراتور سامانه', rawText = '') {
  const { driver: dData, fleet: flData, freight: frData } = extracted;

  // 1. Resolve Driver
  let driverId = 0;
  const cleanNid = dData?.national_id ? toEnglishDigits(dData.national_id).replace(/\D/g, '') : null;
  const cleanPhone = dData?.mobile_number ? toEnglishDigits(dData.mobile_number).replace(/\D/g, '') : null;

  let existingDriver = driversStore.find(d => 
    (cleanNid && d.national_id === cleanNid) ||
    (cleanPhone && d.mobile_number === cleanPhone)
  );

  if (existingDriver) {
    driverId = existingDriver.id;
    if (!existingDriver.mobile_number && cleanPhone) existingDriver.mobile_number = cleanPhone;
    if (existingDriver.full_name === 'نامشخص' && dData?.full_name) existingDriver.full_name = dData.full_name;
  } else {
    driverId = driversStore.length ? Math.max(...driversStore.map(d => d.id)) + 1 : 1;
    const newDriver = {
      id: driverId,
      first_name: dData?.first_name || null,
      last_name: dData?.last_name || null,
      full_name: dData?.full_name || 'راننده ثبت‌شده',
      national_id: cleanNid,
      mobile_number: cleanPhone,
      score: 5.0,
      created_at: '۱۴۰۵/۰۶/۲۱',
      trip_count: 1,
    };
    driversStore.unshift(newDriver);
  }

  // 2. Resolve Fleet
  let fleetId = 0;
  const cleanPlate = flData?.license_plate ? toEnglishDigits(flData.license_plate).replace(/\s+/g, '') : null;
  const cleanSmart = flData?.smart_fleet_number ? toEnglishDigits(flData.smart_fleet_number).replace(/\D/g, '') : null;

  let existingFleet = fleetsStore.find(f =>
    (cleanPlate && toEnglishDigits(f.license_plate).replace(/\s+/g, '') === cleanPlate) ||
    (cleanSmart && f.smart_fleet_number === cleanSmart)
  );

  if (existingFleet) {
    fleetId = existingFleet.id;
  } else {
    fleetId = fleetsStore.length ? Math.max(...fleetsStore.map(f => f.id)) + 1 : 1;
    const newFleet = {
      id: fleetId,
      license_plate: flData?.license_plate || 'پلاک نامشخص',
      smart_fleet_number: cleanSmart,
      vehicle_type: flData?.vehicle_type || 'کامیون',
      vehicle_turn: flData?.vehicle_turn || null,
      created_at: '۱۴۰۵/۰۶/۲۱',
    };
    fleetsStore.unshift(newFleet);
  }

  // 3. Resolve Freight (ALWAYS marked with is_unpressed: true)
  let freightId = 0;
  const cleanAnn = frData?.announcement_number ? toEnglishDigits(frData.announcement_number) : null;
  let existingFreight = freightsStore.find(fr => cleanAnn && fr.announcement_number === cleanAnn);

  if (existingFreight) {
    freightId = existingFreight.id;
  } else {
    freightId = freightsStore.length ? Math.max(...freightsStore.map(fr => fr.id)) + 1 : 1;
    const newFreight = {
      id: freightId,
      announcement_number: cleanAnn || String(Date.now()).slice(-4),
      announcement_type: frData?.announcement_type || 'نوع اول',
      customer_reference: frData?.customer_reference || 'حواله مستقیم',
      origin: frData?.origin || 'مبدا نامشخص',
      destination: frData?.destination || 'مقصد نامشخص',
      cargo_type: frData?.cargo_type || 'پالت کاشی / بار عمومی',
      weight: frData?.weight || null,
      net_price: frData?.net_price || null,
      total_price: frData?.total_price || null,
      commission: frData?.commission || '۵۰۰',
      bill_of_lading_company: 'ایمان بار',
      agent_name: operatorName,
      is_unpressed: true, // USER REQUIREMENT: all info should freight registration should send to database with a unpressed flag
      created_at: '۱۴۰۵/۰۶/۲۱',
    };
    freightsStore.unshift(newFreight);
  }

  // 4. Create Trip (ALWAYS marked with is_unpressed: true)
  const newTripId = tripsStore.length ? Math.max(...tripsStore.map(t => t.id)) + 1 : 985;
  const tripNum = `سفر ${newTripId}#`;
  const nowPersian = `۱۴۰۵/۰۶/۲۱ ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;

  const newTrip = {
    id: newTripId,
    trip_number: tripNum,
    driver_id: driverId,
    fleet_id: fleetId,
    freight_id: freightId,
    status: 'فعال' as const,
    is_unpressed: true, // USER REQUIREMENT: unpressed flag
    operator_name: operatorName,
    trip_date: nowPersian,
    notes: rawText,
    created_at: '۱۴۰۵/۰۶/۲۱',
  };

  tripsStore.unshift(newTrip);

  return {
    trip_id: newTripId,
    trip_number: tripNum,
    is_unpressed: true,
    driver: driversStore.find(d => d.id === driverId),
    fleet: fleetsStore.find(f => f.id === fleetId),
    freight: freightsStore.find(fr => fr.id === freightId),
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Test Cases Endpoint for Employees
app.get('/api/test-cases', (req, res) => {
  res.json({
    success: true,
    test_cases: [
      {
        id: 'tc1',
        title: 'پیام کامل واقعی (از اسکرین‌شات تلگرام)',
        text: 'ناصر مدیر\n14050621\nاعلامیه ۲۴۹\nنوع اول\nماشین چهارم\nشماره ملی راننده ۴۶۴۰۱۱۹۴۰۲ بنام اسماعیل حاتمی\nشماره کامیون ۱۵۴ع۱۶ ایران ۴۳\nشماره هوشمند ۴۲۴۸۹۹۳\n09162961902\n\nاز کاشی اصفهان به گمرک شلمچه حواله آقای میر هاشمی\n\nصافی ۴۶ م\n\n500 ✅\nکل ۵۳ م'
      },
      {
        id: 'tc2',
        title: 'نمونه متن فشرده بار سنگین کیسه جامبو',
        text: '26 تن کیسه جامبو از میمه به مرز خسروی، راننده محمد رضایی، شماره 09123456789، کد ملی 0012345678، پلاک 45ع123 ایران 45، هوشمند 1234567، اعلام بار 78965 صافی 38 م کل 42 م کمیسیون 400'
      },
      {
        id: 'tc3',
        title: 'پیام با اطلاعات ناقص (نیاز به شماره تماس و پلاک)',
        text: 'اعلام بار 249 راننده احمد حسینی برای حمل پالت کاشی از نجف آباد به گمرک مهران، حواله بازرگانی سپهر'
      },
      {
        id: 'tc4',
        title: 'راننده تکراری با پلاک جدید (تست تشخیص تکراری)',
        text: 'اعلامیه 250 بنام مسعود عقراوی 09132668653 کدملی 1810567890، ماشین دوم با کامیون تک 73ع297 ایران 91 از اصفهان به چذابه صافی 44 م کل 50 م'
      }
    ]
  });
});

// AI Extraction Endpoint
app.post('/api/extract', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'متن پیام الزامی است.' });
    }

    const trimmed = message.trim();
    let extractedData: any = null;

    // 1. Try Gemini API server-side
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const prompt = `You are an Iranian freight data extraction engine.
Extract structured logistics JSON from this Persian message:
"""${trimmed}"""

Return strictly a JSON object with:
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
    "vehicle_turn": string or null
  },
  "freight": {
    "announcement_number": string or null,
    "announcement_type": string or null,
    "customer_reference": string or null,
    "origin": string or null,
    "destination": string or null,
    "cargo_type": string or null,
    "weight": string or null,
    "net_price": string or null,
    "total_price": string or null,
    "commission": string or null
  },
  "trip": {
    "available": true,
    "notes": string or null
  },
  "missing_fields": string[],
  "confidence": number
}
Convert all Persian numerals to standard digits (0-9). Do not invent data. If absent, use null.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          }
        });

        if (response.text) {
          extractedData = JSON.parse(response.text);
        }
      } catch (geminiErr) {
        console.warn('Gemini extraction failed, using fallback:', geminiErr);
      }
    }

    // 2. Fallback to rule-based Persian parser
    if (!extractedData) {
      extractedData = ruleBasedExtract(trimmed);
    }

    // Evaluate missing critical fields
    const missing: string[] = [];
    if (!extractedData.driver?.full_name) missing.push('نام راننده');
    if (!extractedData.driver?.mobile_number) missing.push('شماره تماس راننده');
    if (!extractedData.driver?.national_id) missing.push('کد ملی راننده');
    if (!extractedData.fleet?.license_plate) missing.push('پلاک کامیون');
    if (!extractedData.freight?.announcement_number) missing.push('شماره اعلام بار');
    if (!extractedData.freight?.origin && !extractedData.freight?.destination) missing.push('مسیر بارگیری/تخلیه');

    extractedData.missing_fields = missing;

    // Check duplicates against database
    const duplicates = checkDuplicates(extractedData);

    res.json({
      success: true,
      data: extractedData,
      missing_fields: missing,
      is_complete: missing.length === 0,
      duplicates
    });

  } catch (err: any) {
    console.error('Extraction error:', err);
    res.status(500).json({ success: false, error: err.message || 'خطا در پردازش پیام' });
  }
});

// Confirmation & Database Save Endpoint
app.post('/api/confirm', (req, res) => {
  try {
    const { data, operator_name = 'ناصر مدیر', raw_message = '' } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: 'اطلاعات ارسالی نامعتبر است.' });
    }

    const { driver: dData, fleet: flData, freight: frData } = data;

    // 1. Resolve Driver (Reuse if exists, else insert)
    let driverId = 0;
    const cleanNid = dData.national_id ? toEnglishDigits(dData.national_id).replace(/\D/g, '') : null;
    const cleanPhone = dData.mobile_number ? toEnglishDigits(dData.mobile_number).replace(/\D/g, '') : null;

    let existingDriver = driversStore.find(d => 
      (cleanNid && d.national_id === cleanNid) ||
      (cleanPhone && d.mobile_number === cleanPhone)
    );

    if (existingDriver) {
      driverId = existingDriver.id;
      if (!existingDriver.mobile_number && cleanPhone) existingDriver.mobile_number = cleanPhone;
      if (existingDriver.full_name === 'نامشخص' && dData.full_name) existingDriver.full_name = dData.full_name;
    } else {
      driverId = driversStore.length ? Math.max(...driversStore.map(d => d.id)) + 1 : 1;
      const newDriver = {
        id: driverId,
        first_name: dData.first_name || null,
        last_name: dData.last_name || null,
        full_name: dData.full_name || 'راننده ثبت‌شده',
        national_id: cleanNid,
        mobile_number: cleanPhone,
        score: 5.0,
        created_at: '۱۴۰۵/۰۶/۲۱',
        trip_count: 1,
      };
      driversStore.unshift(newDriver);
    }

    // 2. Resolve Fleet
    let fleetId = 0;
    const cleanPlate = flData.license_plate ? toEnglishDigits(flData.license_plate).replace(/\s+/g, '') : null;
    const cleanSmart = flData.smart_fleet_number ? toEnglishDigits(flData.smart_fleet_number).replace(/\D/g, '') : null;

    let existingFleet = fleetsStore.find(f =>
      (cleanPlate && toEnglishDigits(f.license_plate).replace(/\s+/g, '') === cleanPlate) ||
      (cleanSmart && f.smart_fleet_number === cleanSmart)
    );

    if (existingFleet) {
      fleetId = existingFleet.id;
    } else {
      fleetId = fleetsStore.length ? Math.max(...fleetsStore.map(f => f.id)) + 1 : 1;
      const newFleet = {
        id: fleetId,
        license_plate: flData.license_plate || 'پلاک نامشخص',
        smart_fleet_number: cleanSmart,
        vehicle_type: flData.vehicle_type || 'کامیون',
        vehicle_turn: flData.vehicle_turn || null,
        created_at: '۱۴۰۵/۰۶/۲۱',
      };
      fleetsStore.unshift(newFleet);
    }

    // 3. Resolve Freight
    let freightId = 0;
    const cleanAnn = frData.announcement_number ? toEnglishDigits(frData.announcement_number) : null;
    let existingFreight = freightsStore.find(fr => cleanAnn && fr.announcement_number === cleanAnn);

    if (existingFreight) {
      freightId = existingFreight.id;
    } else {
      freightId = freightsStore.length ? Math.max(...freightsStore.map(fr => fr.id)) + 1 : 1;
      const newFreight = {
        id: freightId,
        announcement_number: cleanAnn || String(Date.now()).slice(-4),
        announcement_type: frData.announcement_type || 'نوع اول',
        customer_reference: frData.customer_reference || 'حواله مستقیم',
        origin: frData.origin || 'مبدا نامشخص',
        destination: frData.destination || 'مقصد نامشخص',
        cargo_type: frData.cargo_type || 'پالت کاشی / بار عمومی',
        weight: frData.weight || null,
        net_price: frData.net_price || null,
        total_price: frData.total_price || null,
        commission: frData.commission || '۵۰۰',
        is_unpressed: true,
        bill_of_lading_company: 'ایمان بار',
        agent_name: 'محمدحسین کرم سیچانی',
        created_at: '۱۴۰۵/۰۶/۲۱',
      };
      freightsStore.unshift(newFreight);
    }

    // 4. Create Trip
    const newTripId = tripsStore.length ? Math.max(...tripsStore.map(t => t.id)) + 1 : 985;
    const tripNum = `سفر ${newTripId}#`;
    const nowPersian = `۱۴۰۵/۰۶/۲۱ ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;

    const newTrip = {
      id: newTripId,
      trip_number: tripNum,
      driver_id: driverId,
      fleet_id: fleetId,
      freight_id: freightId,
      status: 'فعال' as const,
      is_unpressed: true,
      operator_name,
      trip_date: nowPersian,
      notes: raw_message,
      created_at: '۱۴۰۵/۰۶/۲۱',
    };

    tripsStore.unshift(newTrip);

    // Resolve relationships for response
    const resolvedTrip = {
      ...newTrip,
      driver: driversStore.find(d => d.id === driverId),
      fleet: fleetsStore.find(f => f.id === fleetId),
      freight: freightsStore.find(fr => fr.id === freightId),
    };

    res.json({
      success: true,
      message: 'سفر با موفقیت در پایگاه داده MySQL ثبت و نهایی شد.',
      trip_id: newTripId,
      trip_number: tripNum,
      trip: resolvedTrip
    });

  } catch (err: any) {
    console.error('Confirm error:', err);
    res.status(500).json({ success: false, error: err.message || 'خطا در ثبت اطلاعات' });
  }
});

// Trips list & search
app.get('/api/trips', (req, res) => {
  const query = (req.query.query as string || '').trim().toLowerCase();
  const status = (req.query.status as string || 'all').trim();
  const unpressedFilter = req.query.unpressed as string | undefined;

  let filtered = tripsStore.map(t => ({
    ...t,
    driver: driversStore.find(d => d.id === t.driver_id),
    fleet: fleetsStore.find(f => f.id === t.fleet_id),
    freight: freightsStore.find(fr => fr.id === t.freight_id),
  }));

  if (status !== 'all') {
    filtered = filtered.filter(t => t.status === status);
  }

  if (unpressedFilter === 'true') {
    filtered = filtered.filter(t => t.is_unpressed === true);
  } else if (unpressedFilter === 'false') {
    filtered = filtered.filter(t => t.is_unpressed === false);
  }

  if (query) {
    filtered = filtered.filter(t => 
      t.trip_number.includes(query) ||
      t.driver?.full_name.includes(query) ||
      t.driver?.mobile_number?.includes(query) ||
      t.freight?.announcement_number.includes(query) ||
      t.freight?.origin.includes(query) ||
      t.freight?.destination.includes(query) ||
      t.fleet?.license_plate.includes(query)
    );
  }

  res.json({ success: true, items: filtered, total: filtered.length });
});

// Drivers list & search
app.get('/api/drivers', (req, res) => {
  const query = (req.query.query as string || '').trim();
  let items = [...driversStore];
  if (query) {
    items = items.filter(d => 
      d.full_name.includes(query) ||
      d.national_id?.includes(query) ||
      d.mobile_number?.includes(query)
    );
  }
  res.json({ success: true, items, total: items.length });
});

// Fleets list & search
app.get('/api/fleets', (req, res) => {
  const query = (req.query.query as string || '').trim();
  let items = [...fleetsStore];
  if (query) {
    items = items.filter(f => 
      f.license_plate.includes(query) ||
      f.smart_fleet_number?.includes(query)
    );
  }
  res.json({ success: true, items, total: items.length });
});

// Freights list & search
app.get('/api/freights', (req, res) => {
  const query = (req.query.query as string || '').trim();
  let items = [...freightsStore];
  if (query) {
    items = items.filter(fr => 
      fr.announcement_number.includes(query) ||
      fr.origin.includes(query) ||
      fr.destination.includes(query) ||
      fr.customer_reference?.includes(query) ||
      fr.cargo_type?.includes(query)
    );
  }
  res.json({ success: true, items, total: items.length });
});

// -------------------------------------------------------------
// GROUP CHAT & VALIDATION RULES ENDPOINTS
// -------------------------------------------------------------

// Get all group chat messages (seen identically by all operators)
app.get('/api/group-messages', (req, res) => {
  res.json({
    success: true,
    messages: groupMessagesStore,
    total: groupMessagesStore.length
  });
});

// Post a message in the group chat
app.post('/api/group-messages', async (req, res) => {
  try {
    const { text, user_id = 'op-1', user_name = 'همکار ترابری', user_role = 'متصدی', avatar_color = '#3b82f6' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, error: 'متن پیام نمی‌تواند خالی باشد.' });
    }

    const trimmed = text.trim();
    const nowTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    // 1. Create the user's message in the group
    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      user_id,
      user_name,
      user_role,
      avatar_color,
      message_type: 'user_freight' as const,
      text: trimmed,
      timestamp: nowTime
    };
    groupMessagesStore.push(userMessage);

    // 2. Perform Extraction (AI or rule-based)
    let extractedData: any = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        const prompt = `You are an Iranian freight data extraction engine.
Extract structured logistics JSON from this Persian message:
"""${trimmed}"""

Return strictly a JSON object:
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
    "vehicle_turn": string or null
  },
  "freight": {
    "announcement_number": string or null,
    "announcement_type": string or null,
    "customer_reference": string or null,
    "origin": string or null,
    "destination": string or null,
    "cargo_type": string or null,
    "weight": string or null,
    "net_price": string or null,
    "total_price": string or null,
    "commission": string or null
  }
}
Convert Persian numerals to standard digits (0-9). Do not hallucinate missing data.`;

        const aiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.1 }
        });
        if (aiRes.text) extractedData = JSON.parse(aiRes.text);
      } catch (e) {
        console.warn('Gemini extraction failed, using rule-based parser:', e);
      }
    }

    if (!extractedData) {
      extractedData = ruleBasedExtract(trimmed);
    }

    // 3. Strict Validation against Active Acceptable Formats
    const validation = validateAgainstRules(extractedData, currentFormatConfig);

    let botMessage: any = null;

    if (!validation.isValid) {
      // THE BOT ONLY SENDS A WARNING REGARDING UNACCEPTABLE FORMATS
      botMessage = {
        id: `bot-warn-${Date.now()}`,
        sender: 'bot' as const,
        message_type: 'bot_warning' as const,
        text: '⚠️ اخطار: فرمت نامعتبر اطلاعات اعلام بار',
        timestamp: nowTime,
        warning_reasons: validation.warnings
      };
      groupMessagesStore.push(botMessage);

      return res.json({
        success: true,
        is_approved: false,
        userMessage,
        botMessage,
        warnings: validation.warnings
      });
    }

    // 4. THE BOT ONLY SENDS AN APPROVED INFO & ALL INFO SENDS TO DB WITH UNPRESSED FLAG
    const regResult = registerFreightToDatabase(extractedData, user_name, trimmed);

    botMessage = {
      id: `bot-appr-${Date.now()}`,
      sender: 'bot' as const,
      message_type: 'bot_approved' as const,
      text: '✅ تاییدیه: اطلاعات اعلام بار تایید شد و با وضعیت «پردازش‌نشده (Unpressed)» در دیتابیس ثبت گردید.',
      timestamp: nowTime,
      approved_info: {
        trip_id: regResult.trip_id,
        trip_number: regResult.trip_number,
        is_unpressed: true,
        driver_name: regResult.driver?.full_name || 'راننده ثبت‌شده',
        driver_national_id: regResult.driver?.national_id || null,
        driver_mobile: regResult.driver?.mobile_number || null,
        license_plate: regResult.fleet?.license_plate || null,
        smart_fleet_number: regResult.fleet?.smart_fleet_number || null,
        announcement_number: regResult.freight?.announcement_number || null,
        origin: regResult.freight?.origin || null,
        destination: regResult.freight?.destination || null,
        net_price: regResult.freight?.net_price || null,
        total_price: regResult.freight?.total_price || null,
        commission: regResult.freight?.commission || null,
        timestamp: nowTime
      }
    };
    groupMessagesStore.push(botMessage);

    return res.json({
      success: true,
      is_approved: true,
      userMessage,
      botMessage,
      trip: regResult
    });

  } catch (err: any) {
    console.error('Error posting to group chat:', err);
    res.status(500).json({ success: false, error: err.message || 'خطا در ارسال پیام به گروه' });
  }
});

// Clear or reset group chat messages
app.delete('/api/group-messages', (req, res) => {
  groupMessagesStore = [];
  res.json({ success: true, message: 'تاریخچه پیام‌های گروه پاکسازی شد.' });
});

// Get active format rules
app.get('/api/format-rules', (req, res) => {
  res.json({ success: true, config: currentFormatConfig });
});

// Update acceptable formats configuration
app.post('/api/format-rules', (req, res) => {
  try {
    if (req.body && req.body.config) {
      currentFormatConfig = { ...currentFormatConfig, ...req.body.config };
      res.json({ success: true, message: 'قوانین و فرمت‌های مجاز به‌روزرسانی شد.', config: currentFormatConfig });
    } else {
      res.status(400).json({ success: false, error: 'پیکربندی فرمت نامعتبر است.' });
    }
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Toggle unpressed flag for a trip
app.patch('/api/trips/:id/toggle-unpressed', (req, res) => {
  const tripId = parseInt(req.params.id, 10);
  const trip = tripsStore.find(t => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ success: false, error: 'سفر یافت نشد.' });
  }

  trip.is_unpressed = !trip.is_unpressed;

  // Also sync freight unpressed flag if linked
  const freight = freightsStore.find(fr => fr.id === trip.freight_id);
  if (freight) {
    freight.is_unpressed = trip.is_unpressed;
  }

  const resolved = {
    ...trip,
    driver: driversStore.find(d => d.id === trip.driver_id),
    fleet: fleetsStore.find(f => f.id === trip.fleet_id),
    freight: freight || null,
  };

  res.json({
    success: true,
    message: trip.is_unpressed ? 'سفر به وضعیت پردازش‌نشده تغییر یافت.' : 'سفر به عنوان پردازش‌شده علامت‌گذاری شد.',
    trip: resolved
  });
});

// Schema mapping config API
let currentMapping = {
  tables: {
    drivers: 'drivers',
    fleets: 'fleets',
    freights: 'freight_announcements',
    trips: 'trips',
    chat_history: 'chat_history',
  },
  columns: {
    drivers: { id: 'id', full_name: 'full_name', national_id: 'national_id', mobile_number: 'mobile_number' },
    fleets: { id: 'id', license_plate: 'license_plate', smart_fleet_number: 'smart_fleet_number' },
    freights: { id: 'id', announcement_number: 'announcement_number', origin: 'origin', destination: 'destination' },
    trips: { id: 'id', trip_number: 'trip_number', driver_id: 'driver_id', fleet_id: 'fleet_id', freight_id: 'freight_id' },
  }
};

app.get('/api/schema-mapping', (req, res) => {
  res.json({ success: true, mapping: currentMapping });
});

app.post('/api/schema-mapping', (req, res) => {
  if (req.body && req.body.tables) {
    currentMapping = req.body;
    res.json({ success: true, message: 'تنظیمات نگاشت پایگاه داده با موفقیت به‌روزرسانی شد.', mapping: currentMapping });
  } else {
    res.status(400).json({ success: false, error: 'داده‌های نگاشت نامعتبر است.' });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
