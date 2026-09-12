import React, { useState } from 'react';
import { Package, Search, MapPin, DollarSign, FileText } from 'lucide-react';
import { FreightAnnouncement } from '../types';
import { toPersianDigits } from '../utils/persian';

interface FreightsScreenProps {
  freights: FreightAnnouncement[];
}

export const FreightsScreen: React.FC<FreightsScreenProps> = ({ freights }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = freights.filter((fr) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      fr.announcement_number.includes(q) ||
      fr.origin.toLowerCase().includes(q) ||
      fr.destination.toLowerCase().includes(q) ||
      fr.customer_reference?.toLowerCase().includes(q) ||
      fr.cargo_type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-24 text-slate-900">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span>اعلام بارهای باربری</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            شماره اعلامیه‌ها، مسیرها، حواله‌های مشتریان و نرخ‌های کرایه
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
          {toPersianDigits(freights.length)} اعلام بار
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجوی شماره اعلام بار، مبدا، مقصد، نوع بار، حواله..."
          className="w-full pl-3 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden shadow-2xs"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((fr) => (
          <div
            key={fr.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3 text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-bold px-2.5 py-0.5 rounded-md font-mono text-xs">
                  اعلامیه {toPersianDigits(fr.announcement_number)}
                </span>
                {fr.announcement_type && (
                  <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {fr.announcement_type}
                  </span>
                )}
              </div>
              <span className="text-slate-400 text-[10px]">{fr.created_at || '۱۴۰۵/۰۶/۲۰'}</span>
            </div>

            {/* Route */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] block">مبدا بارگیری</span>
                  <strong className="text-slate-900 text-xs">{fr.origin}</strong>
                </div>
              </div>

              <span className="text-slate-400 font-bold text-sm">←</span>

              <div className="flex items-center gap-2 text-left">
                <div>
                  <span className="text-slate-400 text-[10px] block">مقصد تخلیه</span>
                  <strong className="text-slate-900 text-xs">{fr.destination}</strong>
                </div>
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
              </div>
            </div>

            {/* Cargo & Customer */}
            <div className="space-y-1 text-slate-600">
              {fr.customer_reference && (
                <div className="text-[11px]">
                  حواله / مشتری: <strong className="text-slate-900">{fr.customer_reference}</strong>
                </div>
              )}
              {fr.cargo_type && (
                <div className="text-[11px]">
                  نوع بار: <span className="text-slate-800">{fr.cargo_type}</span>
                  {fr.weight && ` (${toPersianDigits(fr.weight)})`}
                </div>
              )}
            </div>

            {/* Prices */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
              <div>
                <span className="text-slate-400 text-[10px] block">صافی</span>
                <strong className="text-slate-900 font-bold font-mono">{toPersianDigits(fr.net_price || '—')}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">کرایه کل</span>
                <strong className="text-slate-900 font-bold font-mono">{toPersianDigits(fr.total_price || '—')}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">کمیسیون</span>
                <strong className="text-emerald-700 font-bold font-mono">{toPersianDigits(fr.commission || '—')}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
