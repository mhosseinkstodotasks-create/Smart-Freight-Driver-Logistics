/**
 * Persian Utility Functions
 * Digit conversion, plate parsing, national ID validation
 */

export function toPersianDigits(n: string | number | null | undefined): string {
  if (n === null || n === undefined) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

export function toEnglishDigits(str: string | null | undefined): string {
  if (!str) return '';
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '۸', '٩'];
  let res = str;
  persian.forEach((p, i) => {
    res = res.replace(new RegExp(p, 'g'), i.toString());
  });
  arabic.forEach((a, i) => {
    res = res.replace(new RegExp(a, 'g'), i.toString());
  });
  return res;
}

export function validateIranianNationalId(nid: string | null | undefined): boolean {
  if (!nid) return false;
  const clean = toEnglishDigits(nid).replace(/\D/g, '');
  if (clean.length !== 10) return false;
  if (/^(\d)\1{9}$/.test(clean)) return false;

  const check = parseInt(clean[9], 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i], 10) * (10 - i);
  }
  const rem = sum % 11;
  return (rem < 2 && check === rem) || (rem >= 2 && check === 11 - rem);
}

export function formatIranianPlate(plateStr: string | null | undefined): {
  part1: string; // e.g. 154
  letter: string; // e.g. ع
  part2: string; // e.g. 16
  cityCode: string; // e.g. 43
  raw: string;
} {
  if (!plateStr) {
    return { part1: '---', letter: 'ع', part2: '--', cityCode: '--', raw: '' };
  }

  const raw = plateStr.trim();
  // Example: 154ع16 ایران 43 or 16 ع 154 ایران 43
  const clean = toPersianDigits(raw);
  const match = raw.match(/(\d{2,3})\s*([^\d\s])\s*(\d{2,3})(?:\s*ایران\s*(\d{2}))?/);
  
  if (match) {
    return {
      part1: toPersianDigits(match[1]),
      letter: match[2],
      part2: toPersianDigits(match[3]),
      cityCode: match[4] ? toPersianDigits(match[4]) : '۴۳',
      raw: clean,
    };
  }

  return {
    part1: toPersianDigits(raw.slice(0, 3)),
    letter: 'ع',
    part2: toPersianDigits(raw.slice(3, 5)),
    cityCode: '۴۳',
    raw: clean,
  };
}

export function getPersianNow(): string {
  // Return formatted Persian date representation e.g. "۱۴۰۵/۰۶/۲۱ ۲۲:۴۵"
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `۱۴۰۵/۰۶/۲۱ ${hours}:${minutes}`;
}
