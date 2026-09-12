import React, { useState } from 'react';
import {
  Search,
  Filter,
  Navigation,
  Calendar,
  User,
  Truck,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  X,
  Plus,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import { Trip } from '../types';
import { IranianPlateBadge } from './IranianPlateBadge';
import { toPersianDigits } from '../utils/persian';

interface TripsScreenProps {
  trips: Trip[];
  onNewTripClick: () => void;
  onStatusChange?: (tripId: number, newStatus: any) => void;
  onToggleUnpressed?: (tripId: number) => void;
}

export const TripsScreen: React.FC<TripsScreenProps> = ({
  trips,
  onNewTripClick,
  onStatusChange,
  onToggleUnpressed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpressed' | 'pressed' | 'فعال' | 'لغو سفر'>('all');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const filteredTrips = trips.filter((t) => {
    let matchesStatus = true;
    if (statusFilter === 'unpressed') {
      matchesStatus = t.is_unpressed === true;
    } else if (statusFilter === 'pressed') {
      matchesStatus = t.is_unpressed === false;
    } else if (statusFilter !== 'all') {
      matchesStatus = t.status === statusFilter;
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesStatus;

    const matchesQuery =
      t.trip_number.toLowerCase().includes(query) ||
      t.driver?.full_name.toLowerCase().includes(query) ||
      t.driver?.mobile_number?.includes(query) ||
      t.fleet?.license_plate.includes(query) ||
      t.freight?.announcement_number.includes(query) ||
      t.freight?.origin.includes(query) ||
      t.freight?.destination.includes(query) ||
      t.operator_name.includes(query);

    return matchesStatus && matchesQuery;
  });

  const activeCount = trips.filter((t) => t.status === 'فعال').length;
  const unpressedCount = trips.filter((t) => t.is_unpressed === true).length;
  const cancelledCount = trips.filter((t) => t.status === 'لغو سفر').length;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-24 text-slate-900" dir="rtl">
      {/* Top Metrics Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-amber-500" />
            <span>مدیریت و فهرست سفرهای باربری</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            سفرهای ثبت‌شده از گروه مشترک ترابری با فلگ پردازش‌نشده (Unpressed) و اطلاعات استخراج‌شده
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewTripClick}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ارسال پیام در گروه</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[11px] text-slate-500 block">کل سفرها</span>
          <strong className="text-base font-black text-slate-900 font-mono">
            {toPersianDigits(trips.length)}
          </strong>
        </div>

        <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-300 text-center shadow-2xs">
          <span className="text-[11px] text-amber-900 block font-bold">پردازش‌نشده (Unpressed)</span>
          <strong className="text-base font-black text-amber-700 font-mono">
            {toPersianDigits(unpressedCount)}
          </strong>
        </div>

        <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-center shadow-2xs">
          <span className="text-[11px] text-emerald-800 block font-medium">سفرهای فعال</span>
          <strong className="text-base font-black text-emerald-700 font-mono">
            {toPersianDigits(activeCount)}
          </strong>
        </div>

        <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-200 text-center shadow-2xs">
          <span className="text-[11px] text-rose-800 block font-medium">لغو شده</span>
          <strong className="text-base font-black text-rose-700 font-mono">
            {toPersianDigits(cancelledCount)}
          </strong>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو بر اساس شماره سفر، راننده، پلاک، اعلام بار، مقصد..."
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            همه ({toPersianDigits(trips.length)})
          </button>

          <button
            onClick={() => setStatusFilter('unpressed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'unpressed'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            <span>⚪ پردازش‌نشده (Unpressed)</span>
            <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {toPersianDigits(unpressedCount)}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('pressed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'pressed'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🟢 پردازش‌شده
          </button>

          <button
            onClick={() => setStatusFilter('فعال')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'فعال'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            فعال
          </button>

          <button
            onClick={() => setStatusFilter('لغو سفر')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'لغو سفر'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            لغو سفر
          </button>
        </div>
      </div>

      {/* Trips Cards List */}
      <div className="space-y-3">
        {filteredTrips.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            سفری با این مشخصات یافت نشد.
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const isCancelled = trip.status === 'لغو سفر';

            return (
              <div
                key={trip.id}
                id={`trip-card-${trip.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-4 space-y-3 text-xs"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900 text-amber-400 font-bold px-2 py-0.5 rounded-md font-mono text-xs">
                      {trip.trip_number}
                    </span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {trip.trip_date}
                    </span>
                  </div>

                  {/* Status & Unpressed Badges */}
                  <div className="flex items-center gap-2">
                    {/* Unpressed Pill */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 border ${
                          trip.is_unpressed
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            trip.is_unpressed ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}
                        ></span>
                        <span>{trip.is_unpressed ? 'پردازش‌نشده (Unpressed)' : 'پردازش‌شده (Pressed)'}</span>
                      </span>

                      {onToggleUnpressed && (
                        <button
                          onClick={() => onToggleUnpressed(trip.id)}
                          className="text-[10px] text-slate-600 hover:text-slate-950 font-bold px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition cursor-pointer"
                          title="تغییر وضعیت فلگ پردازش"
                        >
                          {trip.is_unpressed ? 'علامت به عنوان پردازش‌شده' : 'بازگردانی به پردازش‌نشده'}
                        </button>
                      )}
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 ${
                        isCancelled
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCancelled ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {trip.status}
                    </span>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Driver Column */}
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] block">راننده و تماس</span>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-amber-600 shrink-0" />
                      <strong className="text-slate-900 font-bold text-sm">
                        {trip.driver?.full_name || 'نامشخص'}
                      </strong>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      {trip.driver?.national_id && <span className="ml-2">کدملی: {trip.driver.national_id}</span>}
                      {trip.driver?.mobile_number && <span>{trip.driver.mobile_number}</span>}
                    </div>
                  </div>

                  {/* Vehicle Column */}
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] block">ناوگان / پلاک انتظامی</span>
                    <div className="flex items-center gap-2">
                      <IranianPlateBadge plate={trip.fleet?.license_plate} size="sm" />
                    </div>
                    {trip.fleet?.smart_fleet_number && (
                      <span className="text-[10px] text-slate-500 font-mono block">
                        کارت هوشمند: {trip.fleet.smart_fleet_number}
                      </span>
                    )}
                    {trip.fleet?.vehicle_turn && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium inline-block">
                        {trip.fleet.vehicle_turn}
                      </span>
                    )}
                  </div>

                  {/* Freight / Route Column */}
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] block">اعلام بار و مسیر</span>
                    <div className="flex items-center gap-1 text-slate-800 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{trip.freight?.origin} ← {trip.freight?.destination}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      اعلامیه: <strong className="text-slate-700">{trip.freight?.announcement_number}</strong>
                      {trip.freight?.announcement_type && ` (${trip.freight.announcement_type})`}
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
                  <div className="flex items-center gap-3">
                    <span>
                      اپراتور ثبت‌کننده: <strong className="text-slate-800">{trip.operator_name}</strong>
                    </span>
                    {trip.freight?.net_price && (
                      <span className="border-r border-slate-300 pr-3">
                        صافی: <strong className="text-slate-800 font-mono">{trip.freight.net_price}</strong>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedTrip(trip)}
                    className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>مشاهده جزئیات کامل</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">پرونده جامع سفر: {selectedTrip.trip_number}</h3>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Status & Unpressed Info */}
              <div className="bg-slate-100 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">وضعیت پردازش در سیستم:</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5 border ${
                      selectedTrip.is_unpressed
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {selectedTrip.is_unpressed ? 'پردازش‌نشده (Unpressed)' : 'پردازش‌شده (Pressed)'}
                  </span>
                </div>

                {onToggleUnpressed && (
                  <button
                    onClick={() => {
                      onToggleUnpressed(selectedTrip.id);
                      setSelectedTrip({
                        ...selectedTrip,
                        is_unpressed: !selectedTrip.is_unpressed,
                      });
                    }}
                    className="text-xs bg-white border border-slate-300 hover:bg-slate-200 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition"
                  >
                    {selectedTrip.is_unpressed ? 'تغییر وضعیت به پردازش‌شده' : 'بازگردانی به پردازش‌نشده'}
                  </button>
                )}
              </div>

              {/* Driver info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block border-b border-slate-200 pb-1">اطلاعات راننده</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>نام: <strong>{selectedTrip.driver?.full_name}</strong></div>
                  <div>کد ملی: <strong className="font-mono">{selectedTrip.driver?.national_id || '—'}</strong></div>
                  <div>شماره تماس: <strong className="font-mono">{selectedTrip.driver?.mobile_number || '—'}</strong></div>
                  <div>امتیاز راننده: <strong>{selectedTrip.driver?.score || 5} از ۵</strong></div>
                </div>
              </div>

              {/* Fleet info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block border-b border-slate-200 pb-1">اطلاعات ناوگان</span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block mb-1">پلاک:</span>
                    <IranianPlateBadge plate={selectedTrip.fleet?.license_plate} size="md" />
                  </div>
                  <div className="text-left">
                    <div>کارت هوشمند: <strong className="font-mono">{selectedTrip.fleet?.smart_fleet_number || '—'}</strong></div>
                    <div>نوع: <strong>{selectedTrip.fleet?.vehicle_type}</strong></div>
                  </div>
                </div>
              </div>

              {/* Freight info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block border-b border-slate-200 pb-1">مشخصات بار و محموله</span>
                <div className="space-y-1.5">
                  <div>اعلام بار: <strong>شماره {selectedTrip.freight?.announcement_number} ({selectedTrip.freight?.announcement_type})</strong></div>
                  <div>مسیر: <strong>{selectedTrip.freight?.origin} به {selectedTrip.freight?.destination}</strong></div>
                  <div>حواله: <strong>{selectedTrip.freight?.customer_reference || 'ندارد'}</strong></div>
                  <div>نوع بار: <strong>{selectedTrip.freight?.cargo_type || 'پالت کاشی'}</strong></div>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-slate-200 text-center font-bold">
                  <div>صافی: {selectedTrip.freight?.net_price || '—'}</div>
                  <div>کل: {selectedTrip.freight?.total_price || '—'}</div>
                  <div>کمیسیون: {selectedTrip.freight?.commission || '—'}</div>
                </div>
              </div>

              {/* Notes / Raw message */}
              {selectedTrip.notes && (
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-slate-800">
                  <span className="font-bold text-slate-700 block mb-1">متن پیام ثبت‌شده در گروه:</span>
                  <p className="whitespace-pre-wrap font-sans text-xs text-slate-600 leading-relaxed">
                    {selectedTrip.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedTrip(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
