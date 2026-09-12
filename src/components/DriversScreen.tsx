import React, { useState } from 'react';
import { Users, Search, Phone, CreditCard, Star, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';
import { Driver } from '../types';
import { toPersianDigits, validateIranianNationalId } from '../utils/persian';

interface DriversScreenProps {
  drivers: Driver[];
  onAddDriver?: (driver: Partial<Driver>) => void;
}

export const DriversScreen: React.FC<DriversScreenProps> = ({ drivers }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = drivers.filter((d) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      d.full_name.toLowerCase().includes(q) ||
      d.national_id?.includes(q) ||
      d.mobile_number?.includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-24 text-slate-900">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>بانک رانندگان باربری</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ثبت، اعتبارسنجی کدملی و سوابق رانندگان ناوگان
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
          {toPersianDigits(drivers.length)} راننده
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجوی نام، کدملی، شماره همراه..."
          className="w-full pl-3 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden shadow-2xs"
        />
      </div>

      {/* Drivers List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((driver) => {
          const isNidValid = driver.national_id ? validateIranianNationalId(driver.national_id) : false;

          return (
            <div
              key={driver.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                    {driver.full_name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{driver.full_name}</h3>
                    <span className="text-slate-400 text-[11px]">شناسه سیستم: #{driver.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{driver.score || 5}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl space-y-1.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-600">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>کد ملی:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">
                      {driver.national_id ? toPersianDigits(driver.national_id) : '—'}
                    </span>
                    {driver.national_id && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        isNidValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isNidValid ? 'معتبر' : 'خطا'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>شماره همراه:</span>
                  </div>
                  <a
                    href={`tel:${driver.mobile_number}`}
                    className="font-mono font-bold text-amber-700 hover:underline dir-ltr"
                  >
                    {driver.mobile_number ? toPersianDigits(driver.mobile_number) : '—'}
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>تعداد سفرهای ثبت‌شده: <strong>{toPersianDigits(driver.trip_count || 1)}</strong></span>
                <span>تاریخ عضویت: {driver.created_at || '۱۴۰۵/۰۶/۲۰'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
