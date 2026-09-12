import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  CreditCard,
  Truck,
  Package,
  MapPin,
  Edit3,
  Send,
  Sparkles,
  Check,
  AlertCircle,
  Hash,
  DollarSign
} from 'lucide-react';
import { ExtractedData, DuplicateAnalysis } from '../types';
import { IranianPlateBadge } from './IranianPlateBadge';
import { toPersianDigits, validateIranianNationalId } from '../utils/persian';

interface ChatExtractionCardProps {
  extracted: ExtractedData;
  duplicates?: DuplicateAnalysis;
  status?: 'pending_confirmation' | 'confirmed' | 'cancelled';
  savedTripNumber?: string;
  onConfirm: () => void;
  onEdit: () => void;
  isSaving?: boolean;
}

export const ChatExtractionCard: React.FC<ChatExtractionCardProps> = ({
  extracted,
  duplicates,
  status = 'pending_confirmation',
  savedTripNumber,
  onConfirm,
  onEdit,
  isSaving = false,
}) => {
  const { driver, fleet, freight, missing_fields } = extracted;
  const isConfirmed = status === 'confirmed';

  const isNationalIdValid = driver.national_id ? validateIranianNationalId(driver.national_id) : false;

  return (
    <div
      id={`extraction-card-${freight.announcement_number || 'draft'}`}
      className="mt-2 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden text-slate-800 transition-all text-sm"
    >
      {/* Header Banner */}
      <div className={`px-4 py-2.5 flex items-center justify-between ${
        isConfirmed ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-amber-300'
      }`}>
        <div className="flex items-center gap-2 font-bold">
          {isConfirmed ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>ثبت قطعی در پایگاه داده MySQL ({savedTripNumber})</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white">پیش‌نمایش استخراج هوشمند اطلاعات</span>
            </>
          )}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 text-white/90 font-mono">
          دقت استخراج: {toPersianDigits(Math.round((extracted.confidence || 0.92) * 100))}%
        </span>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Missing Fields Warning */}
        {missing_fields && missing_fields.length > 0 && !isConfirmed && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl flex items-start gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">فیلدهای نیازمند تکمیل: </span>
              <span>{missing_fields.join('، ')}. می‌توانید قبل از ثبت آنها را ویرایش کنید.</span>
            </div>
          </div>
        )}

        {/* Duplicate Detection Alert */}
        {duplicates?.driver?.is_duplicate && (
          <div className="bg-sky-50 border border-sky-200 text-sky-900 px-3 py-2 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-sky-600" />
              <span>
                <strong>تشخیص هوشمند: </strong>
                راننده ({driver.full_name}) قبلاً در پایگاه داده ثبت شده و از رکورد موجود استفاده خواهد شد.
              </span>
            </div>
          </div>
        )}

        {/* 1. Driver Section */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-1.5 text-slate-700">
              <User className="w-4 h-4 text-amber-600" />
              <span>اطلاعات راننده</span>
            </div>
            {duplicates?.driver?.is_duplicate ? (
              <span className="bg-sky-100 text-sky-800 text-[10px] px-2 py-0.5 rounded-md font-medium">
                راننده قدیمی
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-md font-medium">
                راننده جدید
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block">نام و نام خانوادگی:</span>
              <strong className="text-slate-900 text-sm font-bold">
                {driver.full_name || 'نامشخص'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block">شماره همراه:</span>
              <span className="font-mono text-slate-800 font-bold dir-ltr inline-block">
                {driver.mobile_number ? toPersianDigits(driver.mobile_number) : 'ثبت‌نشده'}
              </span>
            </div>

            <div className="col-span-2 flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">کد ملی ۱۰ رقمی:</span>
                <span className="font-mono font-bold text-slate-900">
                  {driver.national_id ? toPersianDigits(driver.national_id) : 'ذکر نشده'}
                </span>
              </div>
              {driver.national_id && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isNationalIdValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {isNationalIdValid ? 'کد ملی معتبر' : 'نیازمند بررسی'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Vehicle & Fleet Section */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>مشخصات ناوگان و خودرو</span>
            </div>
            {fleet.vehicle_turn && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-bold">
                {fleet.vehicle_turn}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 text-xs block mb-1">پلاک انتظامی ناوگان:</span>
              <IranianPlateBadge plate={fleet.license_plate} size="md" />
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <span className="text-slate-500 text-xs block">شماره هوشمند ناوگان:</span>
              <strong className="font-mono text-slate-900 text-sm font-bold">
                {fleet.smart_fleet_number ? toPersianDigits(fleet.smart_fleet_number) : '—'}
              </strong>
            </div>
          </div>
        </div>

        {/* 3. Freight Announcement & Route Section */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-600" />
              <span>اعلام بار و اطلاعات مالی</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">شماره اعلامیه:</span>
              <span className="font-mono font-bold text-slate-900">
                {freight.announcement_number ? toPersianDigits(freight.announcement_number) : '—'}
              </span>
              {freight.announcement_type && (
                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                  {freight.announcement_type}
                </span>
              )}
            </div>
          </div>

          {/* Route Display */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] block">مبدا بارگیری:</span>
                <strong className="text-slate-900 font-bold">{freight.origin || 'نامشخص'}</strong>
              </div>
            </div>

            <div className="text-slate-400 font-bold text-base px-2">←</div>

            <div className="flex items-center gap-2 text-left">
              <div>
                <span className="text-slate-400 text-[10px] block">مقصد تخلیه:</span>
                <strong className="text-slate-900 font-bold">{freight.destination || 'نامشخص'}</strong>
              </div>
              <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
            </div>
          </div>

          {/* Customer reference */}
          {freight.customer_reference && (
            <div className="text-xs bg-amber-50/70 text-amber-950 p-2 rounded-lg border border-amber-100">
              <span className="text-slate-500">حواله/مشتری: </span>
              <strong>{freight.customer_reference}</strong>
            </div>
          )}

          {/* Financial summary: Net fare, Total fare, Commission */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block">صافی راننده</span>
              <strong className="text-slate-900 font-bold">
                {freight.net_price ? toPersianDigits(freight.net_price) : '—'}
              </strong>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block">کرایه کل</span>
              <strong className="text-slate-900 font-bold">
                {freight.total_price ? toPersianDigits(freight.total_price) : '—'}
              </strong>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block">کمیسیون</span>
              <strong className="text-emerald-700 font-bold">
                {freight.commission ? toPersianDigits(freight.commission) : '—'}
              </strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isConfirmed ? (
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              id="btn-confirm-save-db"
              onClick={onConfirm}
              disabled={isSaving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>در حال ذخیره در MySQL...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأیید و ثبت نهایی در پایگاه داده</span>
                </>
              )}
            </button>

            <button
              id="btn-edit-extraction"
              onClick={onEdit}
              disabled={isSaving}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-600" />
              <span>ویرایش مشخصات</span>
            </button>
          </div>
        ) : (
          <div className="pt-1 text-center bg-emerald-50 text-emerald-800 py-2 rounded-xl border border-emerald-200 font-bold flex items-center justify-center gap-2 text-xs">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>اطلاعات در MySQL ذخیره شد و سفر در جدول سفرها قرار گرفت.</span>
          </div>
        )}
      </div>
    </div>
  );
};
