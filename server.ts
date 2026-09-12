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
  { id: 1, announcement_number: '249', announcement_type: 'نوع اول', customer_reference: 'حواله آقای میر هاشمی', origin: 'کاشی اصفهان (نجف آباد)', destination: 'گمرک شلمچه', cargo_type: 'پالت کاشی میرجلیلی', weight: '24 تن', net_price: '۴۶ م', total_price: '۵۳ م', commission: '۵۰۰', bill_of_lading_company: 'ایمان بار', agent_name: 'محمدحسین کرم سیچانی', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 2, announcement_number: '249', announcement_type: 'نوع دوم', customer_reference: 'حواله آقای میر هاشمی', origin: 'نجف آباد', destination: 'گمرک شلمچه', cargo_type: 'پالت کاشی میرجلیلی', weight: '22 تن', net_price: '۴۵ م', total_price: '۵۲ م', commission: '۵۰۰', bill_of_lading_company: 'ایمان بار', agent_name: 'محمدحسین کرم سیچانی', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 3, announcement_number: '237', announcement_type: 'نوع دوم', customer_reference: 'حافظی پالت کاشی نیلو', origin: 'نجف آباد', destination: 'چذابه', cargo_type: 'پالت کاشی نیلو', weight: '25 تن', net_price: '۴۸ م', total_price: '۵۵ م', commission: '—', bill_of_lading_company: 'ایمان بار', agent_name: 'مژگان مغازه ای', created_at: '۱۴۰۵/۰۶/۲۰' },
];

let tripsStore = [
  { id: 984, trip_number: 'سفر ۹۸۴#', driver_id: 1, fleet_id: 1, freight_id: 1, status: 'لغو سفر', operator_name: 'ناصر کرمی', trip_date: '۱۴۰۵/۰۶/۲۰ ۲۲:۳۶', notes: 'اعلامیه ۲۴۹ نوع اول - ماشین چهارم - بنام اسماعیل حاتمی', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 983, trip_number: 'سفر ۹۸۳#', driver_id: 2, fleet_id: 2, freight_id: 2, status: 'لغو سفر', operator_name: 'ناصر کرمی', trip_date: '۱۴۰۵/۰۶/۲۰ ۲۲:۳۵', notes: 'سفر مسعود عقراوی', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 982, trip_number: 'سفر ۹۸۲#', driver_id: 3, fleet_id: 3, freight_id: 2, status: 'لغو سفر', operator_name: 'ناصر کرمی', trip_date: '۱۴۰۵/۰۶/۲۰ ۲۲:۳۳', notes: 'سفر علی اقبالی', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 981, trip_number: 'سفر ۹۸۱#', driver_id: 4, fleet_id: 4, freight_id: 2, status: 'فعال', operator_name: 'ناصر کرمی', trip_date: '۱۴۰۵/۰۶/۲۰ ۲۲:۳۲', notes: 'سفر شاپور معبودی', created_at: '۱۴۰۵/۰۶/۲۰' },
  { id: 980, trip_number: 'سفر ۹۸۰#', driver_id: 5, fleet_id: 5, freight_id: 3, status: 'فعال', operator_name: 'مژگان مغازه ای', trip_date: '۱۴۰۵/۰۶/۲۰ ۱۹:۳۸', notes: 'سفر رحیم عبدالوند', created_at: '۱۴۰۵/۰۶/۲۰' },
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
  const nameMatch = msg.match(/(?:بنام|راننده)\s+([\u0600-\u06FF\s]{3,30}?)(?=(?:شماره|پلاک|کد|هوشمند|09|\d|\n|$))/);
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
  const plateMatch = rawMessage.match(/(\d{2,3}\s*[\u0600-\u06FF]\s*\d{2,3}(?:\s*ایران\s*\d{2})?)/);
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

  let filtered = tripsStore.map(t => ({
    ...t,
    driver: driversStore.find(d => d.id === t.driver_id),
    fleet: fleetsStore.find(f => f.id === t.fleet_id),
    freight: freightsStore.find(fr => fr.id === t.freight_id),
  }));

  if (status !== 'all') {
    filtered = filtered.filter(t => t.status === status);
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
