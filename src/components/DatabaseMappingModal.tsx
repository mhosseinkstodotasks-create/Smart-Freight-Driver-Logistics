import React, { useState } from 'react';
import {
  Database,
  X,
  Code2,
  Table,
  Check,
  Copy,
  Download,
  AlertCircle,
  FileCode,
  Terminal,
  Save
} from 'lucide-react';
import { SchemaMappingConfig } from '../types';

interface DatabaseMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapping: SchemaMappingConfig;
  onUpdateMapping?: (mapping: SchemaMappingConfig) => void;
}

export const DatabaseMappingModal: React.FC<DatabaseMappingModalProps> = ({
  isOpen,
  onClose,
  mapping,
  onUpdateMapping,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'adapter' | 'inspect_sql' | 'php_config'>('adapter');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editableTables, setEditableTables] = useState({ ...mapping.tables });

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveMapping = () => {
    if (onUpdateMapping) {
      onUpdateMapping({
        ...mapping,
        tables: editableTables,
      });
    }
  };

  const inspectSqlCode = `-- SQL Inspection Script for Existing Freight Logistics Database
-- Execute this in phpMyAdmin or MySQL to discover your exact table and column names:
SET @TARGET_DB = DATABASE();

-- 1. List all tables
SELECT TABLE_NAME, TABLE_ROWS, TABLE_COMMENT 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = @TARGET_DB;

-- 2. Inspect all columns, types, and primary keys
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, IS_NULLABLE
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @TARGET_DB 
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 3. Discover Foreign Keys & Relationships
SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = @TARGET_DB AND REFERENCED_TABLE_NAME IS NOT NULL;`;

  const phpConfigCode = `<?php
// php_backend/config/tables.php
// Centralized schema mapping for your existing MySQL database

return [
    'tables' => [
        'drivers'      => '${editableTables.drivers}',
        'fleets'       => '${editableTables.fleets}',
        'freights'     => '${editableTables.freights}',
        'trips'        => '${editableTables.trips}',
        'chat_history' => '${editableTables.chat_history}',
    ],
    'columns' => [
        'drivers' => [
            'id'            => 'id',
            'full_name'     => 'full_name',
            'national_id'   => 'national_id',
            'mobile_number' => 'mobile_number',
        ],
        'fleets' => [
            'id'                 => 'id',
            'license_plate'      => 'license_plate',
            'smart_fleet_number' => 'smart_fleet_number',
            'vehicle_turn'       => 'vehicle_turn',
        ],
        'freights' => [
            'id'                  => 'id',
            'announcement_number' => 'announcement_number',
            'origin'              => 'origin',
            'destination'         => 'destination',
            'net_price'           => 'net_price',
            'total_price'         => 'total_price',
        ],
        'trips' => [
            'id'          => 'id',
            'trip_number' => 'trip_number',
            'driver_id'   => 'driver_id',
            'fleet_id'    => 'fleet_id',
            'freight_id'  => 'freight_id',
            'status'      => 'status',
        ]
    ]
];`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div
        id="db-mapping-modal"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-900 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-base">تنظیمات آداپتور دیتابیس MySQL و اسکریپت‌های بازرسی</h3>
              <p className="text-xs text-slate-400">انعطاف‌پذیری ۱۰۰٪ با ساختار دیتابیس فعلی شرکت</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('adapter')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'adapter'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>نگاشت جداول دیتابیس</span>
          </button>

          <button
            onClick={() => setActiveTab('inspect_sql')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inspect_sql'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>اسکریپت کشف ساختار (SQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('php_config')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'php_config'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>کد PHP پیکربندی (tables.php)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {activeTab === 'adapter' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-sky-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>معماری آداپتور پایگاه داده (Database Adapter Pattern)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  اگر نام جدول‌های پایگاه داده موجود شرکت شما با مقادیر پیش‌فرض متفاوت است، کافیست نام‌های واقعی را در کادرهای زیر وارد کنید. تمام کوئری‌های PHP بدون نیاز به دستکاری کد به این جداول متصل می‌شوند.
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm">نام جداول واقعی در دیتابیس شما:</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">جدول رانندگان (Drivers):</label>
                    <input
                      type="text"
                      value={editableTables.drivers}
                      onChange={(e) => setEditableTables({ ...editableTables, drivers: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">جدول ناوگان/کامیون‌ها (Fleets):</label>
                    <input
                      type="text"
                      value={editableTables.fleets}
                      onChange={(e) => setEditableTables({ ...editableTables, fleets: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">جدول اعلام بارها (Freight Announcements):</label>
                    <input
                      type="text"
                      value={editableTables.freights}
                      onChange={(e) => setEditableTables({ ...editableTables, freights: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">جدول سفرها (Trips):</label>
                    <input
                      type="text"
                      value={editableTables.trips}
                      onChange={(e) => setEditableTables({ ...editableTables, trips: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveMapping}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>بروزرسانی نگاشت جداول</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inspect_sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">اسکریپت بازرسی MySQL (نیازمندی بند ۲۰):</span>
                <button
                  onClick={() => handleCopy('inspect_sql', inspectSqlCode)}
                  className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition cursor-pointer"
                >
                  {copiedKey === 'inspect_sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'inspect_sql' ? 'کپی شد!' : 'کپی اسکریپت SQL'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto dir-ltr">
                <pre>{inspectSqlCode}</pre>
              </div>

              <p className="text-slate-500 text-[11px]">
                این اسکریپت در فایل <code>php_backend/database_inspect.sql</code> نیز ذخیره شده است و بدون هیچ خطری تمام جداول و کلیدهای خارجی پایگاه داده شما را گزارش می‌دهد.
              </p>
            </div>
          )}

          {activeTab === 'php_config' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">محتوای فایل config/tables.php در سرور PHP:</span>
                <button
                  onClick={() => handleCopy('php_config', phpConfigCode)}
                  className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition cursor-pointer"
                >
                  {copiedKey === 'php_config' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'php_config' ? 'کپی شد!' : 'کپی کد PHP'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto dir-ltr">
                <pre>{phpConfigCode}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
