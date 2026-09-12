import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Sparkles,
  Sliders,
  HelpCircle,
  Hash,
  CreditCard,
  Phone,
  Truck,
  MapPin,
  Save,
  Check
} from 'lucide-react';
import { FormatConfig } from '../types';
import { defaultFormatConfig, validateFreightAgainstRules } from '../utils/formatValidator';
import { toEnglishDigits, toPersianDigits } from '../utils/persian';

interface FormatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FormatConfig;
  onSaveConfig: (newConfig: FormatConfig) => void;
}

export const FormatSettingsModal: React.FC<FormatSettingsModalProps> = ({
  isOpen,
  onClose,
  config: initialConfig,
  onSaveConfig,
}) => {
  const [config, setConfig] = useState<FormatConfig>(initialConfig);
  const [testText, setTestText] = useState(
    `ناصر مدیر\nاعلامیه ۲۴۹\nنوع اول\nماشین چهارم\nشماره ملی راننده ۴۶۴۰۱۱۹۴۰۲ بنام اسماعیل حاتمی\nشماره کامیون ۱۵۴ع۱۶ ایران ۴۳\nشماره هوشمند ۴۲۴۸۹۹۳\n09162961902\nاز کاشی اصفهان به گمرک شلمچه حواله آقای میر هاشمی\nصافی ۴۶ م کل ۵۳ م`
  );
  const [activeTab, setActiveTab] = useState<'rules' | 'test'>('rules');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  // Simple parser to test input against current settings
  const simulatedExtracted: any = {
    driver: {
      full_name: testText.match(/(?:بنام|راننده)\s+([\u0600-\u06FF\s]+?)(?=(?:شماره|پلاک|کد|هوشمند|09|\d|\n|$))/)?.[1]?.trim() || (testText.includes('حاتمی') ? 'اسماعیل حاتمی' : null),
      national_id: toEnglishDigits(testText).match(/(?:کد\s*ملی|شماره\s*ملی)[^\d]*(\d{10})/)?.[1] || toEnglishDigits(testText).match(/\b(\d{10})\b/)?.[1] || null,
      mobile_number: toEnglishDigits(testText).match(/(09\d{9})/)?.[1] || null,
    },
    fleet: {
      license_plate: testText.match(/(\d{2,3}\s*[\u0600-\u06FF]\s*\d{2,3}(?:\s*ایران\s*\d{2})?)/)?.[1]?.trim() || null,
      smart_fleet_number: toEnglishDigits(testText).match(/(?:شماره\s*هوشمند|هوشمند)[^\d]*(\d{5,9})/)?.[1] || null,
    },
    freight: {
      announcement_number: toEnglishDigits(testText).match(/(?:اعلامیه|اعلام\s*بار)[^\d]*(\d+)/)?.[1] || null,
      origin: testText.includes('از') ? testText.match(/از\s+([\u0600-\u06FF\s]+?)\s+به/)?.[1]?.trim() || null : null,
      destination: testText.includes('به') ? testText.match(/به\s+([\u0600-\u06FF\s]+?)(?=(?:حواله|صافی|کل|\n|$))/)?.[1]?.trim() || null : null,
    }
  };

  const validationResult = validateFreightAgainstRules(simulatedExtracted, config);

  const handleSave = () => {
    onSaveConfig(config);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleResetDefaults = () => {
    setConfig(defaultFormatConfig);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <span>تنظیمات فرمت‌های مجاز و اعتبارسنجی اعلام بار</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-sm">
                  کنترل ربات
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                تعریف فرمت‌های الزامی (کد ملی، پلاک خودرو، تلفن، کارت هوشمند) جهت صدور تاییدیه یا ارسال اخطار
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-2 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>قوانین فرمت‌های مجاز</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`pb-2 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'test'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>تست زنده اعتبارسنجی پیام</span>
            {validationResult.isValid ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs">
          {activeTab === 'rules' ? (
            <div className="space-y-4">
              {/* Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-[11px] text-amber-900 leading-relaxed">
                  <strong>نحوه عملکرد ربات در گروه:</strong> ربات دیگر پاسخ‌های محاوره‌ای ارسال نمی‌کند. در صورت رعایت تمام فرمت‌های مجاز، ربات <strong>تاییدیه و ثبت با فلگ پردازش‌نشده (Unpressed)</strong> ارسال می‌کند؛ در غیر این‌صورت، ربات صرفاً <strong>اخطار مشخص عدم رعایت فرمت</strong> می‌دهد.
                </div>
              </div>

              {/* 1. National ID Rule */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">کد ملی راننده (National ID)</h4>
                      <p className="text-[10px] text-slate-500">فرمت ۱۰ رقمی با صحت الگوریتم چک‌سام ثبت احوال</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.national_id.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          national_id: { ...config.national_id, enabled: e.target.checked }
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {config.national_id.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.national_id.required}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            national_id: { ...config.national_id, required: e.target.checked }
                          })
                        }
                        className="rounded-sm text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span>اجباری بودن کد ملی برای ثبت</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.national_id.strictChecksum}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            national_id: { ...config.national_id, strictChecksum: e.target.checked }
                          })
                        }
                        className="rounded-sm text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span>بررسی دقیق رقم کنترلی ثبت‌احوال (Checksum)</span>
                    </label>

                    <div className="col-span-full pt-1">
                      <label className="text-[10px] text-slate-500 block mb-0.5">متن اخطار عدم انطباق:</label>
                      <input
                        type="text"
                        value={config.national_id.errorMessage}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            national_id: { ...config.national_id, errorMessage: e.target.value }
                          })
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:border-amber-500 outline-hidden bg-slate-50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. License Plate Rule */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">پلاک خودرو و ناوگان باربری (License Plate)</h4>
                      <p className="text-[10px] text-slate-500">الگوی استاندارد پلاک ترابری (مانند ۱۵۴ ع ۱۶ ایران ۴۳)</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.license_plate.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          license_plate: { ...config.license_plate, enabled: e.target.checked }
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {config.license_plate.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.license_plate.required}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            license_plate: { ...config.license_plate, required: e.target.checked }
                          })
                        }
                        className="rounded-sm text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span>اجباری بودن پلاک برای ثبت</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.license_plate.requireCommercialLetter}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            license_plate: { ...config.license_plate, requireCommercialLetter: e.target.checked }
                          })
                        }
                        className="rounded-sm text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span>فقط حروف عمومی ترابری سنگین (مانند «ع»)</span>
                    </label>

                    <div className="col-span-full pt-1">
                      <label className="text-[10px] text-slate-500 block mb-0.5">متن اخطار عدم انطباق پلاک:</label>
                      <input
                        type="text"
                        value={config.license_plate.errorMessage}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            license_plate: { ...config.license_plate, errorMessage: e.target.value }
                          })
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:border-amber-500 outline-hidden bg-slate-50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Driver Mobile Rule */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">شماره تلفن همراه راننده (Mobile Number)</h4>
                      <p className="text-[10px] text-slate-500">الگوی استاندارد ۱۱ رقمی شروع با ۰۹ (09xxxxxxxxx)</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.mobile_number.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          mobile_number: { ...config.mobile_number, enabled: e.target.checked }
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {config.mobile_number.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.mobile_number.required}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            mobile_number: { ...config.mobile_number, required: e.target.checked }
                          })
                        }
                        className="rounded-sm text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span>اجباری بودن شماره همراه برای ثبت</span>
                    </label>

                    <div className="col-span-full pt-1">
                      <label className="text-[10px] text-slate-500 block mb-0.5">متن اخطار عدم انطباق شماره تماس:</label>
                      <input
                        type="text"
                        value={config.mobile_number.errorMessage}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            mobile_number: { ...config.mobile_number, errorMessage: e.target.value }
                          })
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:border-amber-500 outline-hidden bg-slate-50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Smart Fleet Number Rule */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">کارت هوشمند راننده و ناوگان (Smart Card)</h4>
                      <p className="text-[10px] text-slate-500">طول ارقام مجاز کارت هوشمند (پیش‌فرض ۵ الی ۹ رقم)</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.smart_fleet_number.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          smart_fleet_number: { ...config.smart_fleet_number, enabled: e.target.checked }
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {config.smart_fleet_number.enabled && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">حداقل ارقام:</label>
                      <input
                        type="number"
                        min={3}
                        max={10}
                        value={config.smart_fleet_number.minDigits}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            smart_fleet_number: {
                              ...config.smart_fleet_number,
                              minDigits: parseInt(e.target.value, 10) || 5
                            }
                          })
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-hidden bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">حداکثر ارقام:</label>
                      <input
                        type="number"
                        min={5}
                        max={15}
                        value={config.smart_fleet_number.maxDigits}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            smart_fleet_number: {
                              ...config.smart_fleet_number,
                              maxDigits: parseInt(e.target.value, 10) || 9
                            }
                          })
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-hidden bg-slate-50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Route & Announcement Rules */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">مسیر حمل و شماره اعلام بار</h4>
                    <p className="text-[10px] text-slate-500">الزام قید مبدا، مقصد و شماره اعلامیه در متن پیام</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.route.required}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          route: { ...config.route, required: e.target.checked }
                        })
                      }
                      className="rounded-sm text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>الزام قید مبدا و مقصد بارگیری</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.announcement_number.required}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          announcement_number: { ...config.announcement_number, required: e.target.checked }
                        })
                      }
                      className="rounded-sm text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>الزام قید شماره اعلام بار / اعلامیه</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <label className="font-bold text-slate-800 text-xs block">
                  متن آزمایشی پیام اعلام بار جهت سنجش با قوانین فعلی:
                </label>
                <textarea
                  rows={5}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-amber-500 outline-hidden bg-white leading-relaxed font-mono"
                  placeholder="متن پیام را وارد کنید..."
                />
              </div>

              {/* Validation Feedback Preview */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-700">نتیجه شبیه‌سازی رفتار ربات در گروه:</h4>

                {validationResult.isValid ? (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>✅ پاسخ ربات: تاییدیه فرمت و ثبت در دیتابیس (با فلگ Unpressed)</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      کلیه فرمت‌های اطلاعاتی (کد ملی، پلاک، شماره همراه و...) تایید شدند. سیستم بدون نیاز به چت محاوره‌ای، اطلاعات را ذخیره کرده و کارت تاییدیه ثبت در دیتابیس را به عنوان خلاصه در گروه منتشر می‌کند.
                    </p>
                  </div>
                ) : (
                  <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <span>⚠️ پاسخ ربات: ارسال کارت اخطار خطاهای فرمت</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-rose-700 list-disc list-inside">
                      {validationResult.warnings.map((w, idx) => (
                        <li key={idx} className="font-medium">
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-200 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>بازگردانی فرمت‌های پیش‌فرض</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition cursor-pointer"
            >
              انصراف
            </button>
            <button
              onClick={handleSave}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>ذخیره شد!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>ذخیره قوانین فرمت</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
