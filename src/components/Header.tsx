import React from 'react';
import { Truck, ShieldCheck, Database, RefreshCw, UserCheck, Sliders } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onOpenDbModal: () => void;
  onOpenFormatModal?: () => void;
  onRefreshData?: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenDbModal,
  onOpenFormatModal,
  onRefreshData,
  isLoading = false,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md select-none"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
            <Truck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-white">سامانه ترابری و اعلام بار گروهی</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                گروه فعال
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              سامانه پرسنلی • اعتبارسنجی خودکار فرمت و ثبت در دیتابیس با فلگ Unpressed
            </p>
          </div>
        </div>

        {/* Action buttons & Operator identity */}
        <div className="flex items-center gap-2">
          {/* Format Settings Button */}
          {onOpenFormatModal && (
            <button
              id="btn-format-rules"
              onClick={onOpenFormatModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
              title="تنظیم فرمت‌های مجاز اعلام بار (کد ملی، پلاک و ...)"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">فرمت‌های مجاز</span>
            </button>
          )}

          {/* Database Adapter Inspection Button */}
          <button
            id="btn-inspect-db"
            onClick={onOpenDbModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition cursor-pointer"
            title="مشاهده ساختار و نگاشت جداول دیتابیس MySQL"
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">جداول دیتابیس</span>
          </button>

          {/* Refresh Button */}
          {onRefreshData && (
            <button
              id="btn-refresh-data"
              onClick={onRefreshData}
              disabled={isLoading}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer disabled:opacity-50"
              title="بروزرسانی داده‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
