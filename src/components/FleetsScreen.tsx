import React, { useState } from 'react';
import { Truck, Search, ShieldCheck, Hash } from 'lucide-react';
import { Fleet } from '../types';
import { IranianPlateBadge } from './IranianPlateBadge';
import { toPersianDigits } from '../utils/persian';

interface FleetsScreenProps {
  fleets: Fleet[];
}

export const FleetsScreen: React.FC<FleetsScreenProps> = ({ fleets }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = fleets.filter((f) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      f.license_plate.includes(q) ||
      f.smart_fleet_number?.includes(q) ||
      f.vehicle_turn?.includes(q) ||
      f.vehicle_type?.includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-24 text-slate-900">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-500" />
            <span>ناوگان و خودروهای باربری</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            فهرست پلاک‌های انتظامی زرد، کارت هوشمند ناوگان و نوبت‌های خودرو
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
          {toPersianDigits(fleets.length)} ناوگان
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجوی پلاک، شماره هوشمند ناوگان، نوع ماشین..."
          className="w-full pl-3 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden shadow-2xs"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((fleet) => (
          <div
            key={fleet.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-sm">{fleet.vehicle_type || 'کامیون'}</span>
              {fleet.vehicle_turn && (
                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md text-[11px]">
                  {fleet.vehicle_turn}
                </span>
              )}
            </div>

            {/* License plate visual */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 text-xs">پلاک انتظامی:</span>
              <IranianPlateBadge plate={fleet.license_plate} size="md" />
            </div>

            {/* Smart card & details */}
            <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px]">کارت هوشمند ناوگان:</span>
                <strong className="font-mono font-bold text-slate-900 text-xs">
                  {fleet.smart_fleet_number ? toPersianDigits(fleet.smart_fleet_number) : 'ثبت‌نشده'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">تاریخ ثبت در سیستم:</span>
                <span className="font-mono text-slate-700">{fleet.created_at || '۱۴۰۵/۰۶/۲۰'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
