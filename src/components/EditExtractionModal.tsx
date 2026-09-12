import React, { useState } from 'react';
import { X, Save, User, Truck, Package, AlertCircle } from 'lucide-react';
import { ExtractedData } from '../types';
import { toEnglishDigits, toPersianDigits, validateIranianNationalId } from '../utils/persian';

interface EditExtractionModalProps {
  isOpen: boolean;
  data: ExtractedData;
  onClose: () => void;
  onSave: (updatedData: ExtractedData) => void;
}

export const EditExtractionModal: React.FC<EditExtractionModalProps> = ({
  isOpen,
  data,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<ExtractedData>(JSON.parse(JSON.stringify(data)));

  const handleDriverChange = (field: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      driver: { ...prev.driver, [field]: val },
    }));
  };

  const handleFleetChange = (field: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      fleet: { ...prev.fleet, [field]: val },
    }));
  };

  const handleFreightChange = (field: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      freight: { ...prev.freight, [field]: val },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isNidValid = formData.driver.national_id
    ? validateIranianNationalId(formData.driver.national_id)
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        id="edit-extraction-modal"
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold">ویرایش و تکمیل اطلاعات استخراج‌شده</h3>
            <p className="text-xs text-slate-400">اطلاعات را قبل از ثبت قطعی در دیتابیس اصلاح فرمایید</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Section 1: Driver */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm border-b border-slate-200 pb-1">
              <User className="w-4 h-4 text-amber-600" />
              <span>مشخصات راننده</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">نام و نام خانوادگی:</label>
                <input
                  type="text"
                  value={formData.driver.full_name || ''}
                  onChange={(e) => handleDriverChange('full_name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="اسماعیل حاتمی"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">شماره همراه:</label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.driver.mobile_number || ''}
                  onChange={(e) => handleDriverChange('mobile_number', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white focus:border-amber-500 focus:outline-hidden text-right"
                  placeholder="09162961902"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-slate-600">کد ملی (۱۰ رقم):</label>
                  {formData.driver.national_id && (
                    <span className={`text-[10px] font-bold ${isNidValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isNidValid ? '✓ کد ملی صحیح است' : '⚠ کد ملی نامعتبر است'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.driver.national_id || ''}
                  onChange={(e) => handleDriverChange('national_id', e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg font-mono text-slate-900 focus:bg-white focus:outline-hidden text-right ${
                    formData.driver.national_id && !isNidValid
                      ? 'border-rose-300 bg-rose-50/40'
                      : 'border-slate-300 focus:border-amber-500'
                  }`}
                  placeholder="4640119402"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Fleet */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm border-b border-slate-200 pb-1">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>مشخصات ناوگان</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">پلاک خودرو:</label>
                <input
                  type="text"
                  value={formData.fleet.license_plate || ''}
                  onChange={(e) => handleFleetChange('license_plate', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="154ع16 ایران 43"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">شماره هوشمند ناوگان:</label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.fleet.smart_fleet_number || ''}
                  onChange={(e) => handleFleetChange('smart_fleet_number', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white focus:border-amber-500 focus:outline-hidden text-right"
                  placeholder="4248993"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">نوبت ماشین:</label>
                <input
                  type="text"
                  value={formData.fleet.vehicle_turn || ''}
                  onChange={(e) => handleFleetChange('vehicle_turn', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="ماشین چهارم"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">نوع ناوگان:</label>
                <input
                  type="text"
                  value={formData.fleet.vehicle_type || 'کامیون ده چرخ'}
                  onChange={(e) => handleFleetChange('vehicle_type', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Freight Announcement */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm border-b border-slate-200 pb-1">
              <Package className="w-4 h-4 text-amber-600" />
              <span>اعلام بار و کرایه</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">شماره اعلام بار:</label>
                <input
                  type="text"
                  value={formData.freight.announcement_number || ''}
                  onChange={(e) => handleFreightChange('announcement_number', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="249"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">نوع اعلامیه:</label>
                <input
                  type="text"
                  value={formData.freight.announcement_type || ''}
                  onChange={(e) => handleFreightChange('announcement_type', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="نوع اول"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">مبدا بارگیری:</label>
                <input
                  type="text"
                  value={formData.freight.origin || ''}
                  onChange={(e) => handleFreightChange('origin', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="کاشی اصفهان (نجف آباد)"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">مقصد تخلیه:</label>
                <input
                  type="text"
                  value={formData.freight.destination || ''}
                  onChange={(e) => handleFreightChange('destination', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="گمرک شلمچه"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-600 mb-1">حواله یا مشتری:</label>
                <input
                  type="text"
                  value={formData.freight.customer_reference || ''}
                  onChange={(e) => handleFreightChange('customer_reference', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="حواله آقای میر هاشمی"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">صافی راننده:</label>
                <input
                  type="text"
                  value={formData.freight.net_price || ''}
                  onChange={(e) => handleFreightChange('net_price', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="۴۶ م"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">کرایه کل:</label>
                <input
                  type="text"
                  value={formData.freight.total_price || ''}
                  onChange={(e) => handleFreightChange('total_price', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="۵۳ م"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-600 mb-1">کمیسیون / پورسانت:</label>
                <input
                  type="text"
                  value={formData.freight.commission || ''}
                  onChange={(e) => handleFreightChange('commission', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="500"
                />
              </div>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات و بازگشت به پیش‌نمایش</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
