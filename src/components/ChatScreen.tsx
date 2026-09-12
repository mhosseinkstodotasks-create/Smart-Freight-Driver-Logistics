import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sliders,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  RefreshCw,
  Layers,
  FileText,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Edit3,
  ExternalLink,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { ChatMessage, FormatConfig, GroupUser } from '../types';
import { toPersianDigits } from '../utils/persian';

interface ChatScreenProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, user: GroupUser) => void;
  onClearChat: () => void;
  onRefreshMessages?: () => void;
  onOpenFormatModal: () => void;
  onToggleUnpressed?: (tripId: number) => void;
  onNavigateToTrips?: () => void;
  isProcessing: boolean;
}

const PRESET_USERS: GroupUser[] = [
  { id: 'op-1', name: 'ناصر مدیر', role: 'مدیر ترابری و پایانه', avatarColor: '#f59e0b' },
  { id: 'op-2', name: 'رضا رضایی', role: 'متصدی بارگیری', avatarColor: '#3b82f6' },
  { id: 'op-3', name: 'مژگان مغازه‌ای', role: 'کارشناس حمل و نقل', avatarColor: '#8b5cf6' },
  { id: 'op-4', name: 'محمدحسین کرم', role: 'مدیر اعلام بار', avatarColor: '#10b981' },
];

const SAMPLE_TEMPLATES = [
  {
    label: '✅ نمونه پیام کامل (تایید و ثبت Unpressed)',
    text: `ناصر مدیر
14050621
اعلامیه ۲۴۹
نوع اول
ماشین چهارم
شماره ملی راننده ۴۶۴۰۱۱۹۴۰۲ بنام اسماعیل حاتمی
شماره کامیون ۱۵۴ع۱۶ ایران ۴۳
شماره هوشمند ۴۲۴۸۹۹۳
09162961902

از کاشی اصفهان به گمرک شلمچه حواله آقای میر هاشمی

صافی ۴۶ م

500 ✅
کل ۵۳ م`,
  },
  {
    label: '⚠️ نمونه خطای کد ملی (نمایش اخطار ربات)',
    text: `اعلام بار 249 راننده احمد حسینی کد ملی 45892 برای حمل پالت کاشی از نجف آباد به گمرک مهران، پلاک 154ع16 ایران 43، شماره 09123456789`,
  },
  {
    label: '⚠️ نمونه خطای پلاک خودرو (نمایش اخطار ربات)',
    text: `اعلامیه 250 بنام محمد رضایی کد ملی 0012345678 تلفن 09123456789 با پلاک نامعتبر 1234 از اصفهان به تبریز صافی 40 م کل 45 م`,
  },
  {
    label: '🚛 نمونه بار سنگین میمه به خسروی',
    text: `اعلام بار 255 - نوع اول
بنام مسعود عقراوی 09132668653 کدملی 1810567890
تریلی کفی 11ع125 ایران 13 شماره هوشمند 3982104
25 تن کیسه جامبو از کارخانه میمه به مرز خسروی
حواله شرکت بازرگانی مهرگان
صافی 44 م کل 51 م کمیسیون 500`,
  },
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  onRefreshMessages,
  onOpenFormatModal,
  onToggleUnpressed,
  onNavigateToTrips,
  isProcessing,
}) => {
  const [currentUser, setCurrentUser] = useState<GroupUser>(PRESET_USERS[0]);
  const [isCustomUserModal, setIsCustomUserModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('متصدی ترابری');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim(), currentUser);
    setInputText('');
  };

  const handleAddCustomUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newUser: GroupUser = {
      id: `usr-${Date.now()}`,
      name: customName.trim(),
      role: customRole.trim() || 'همکار ترابری',
      avatarColor: '#ec4899',
    };
    setCurrentUser(newUser);
    setIsCustomUserModal(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] max-w-3xl mx-auto bg-slate-100 relative shadow-md rounded-2xl overflow-hidden border border-slate-200" dir="rtl">
      {/* Group Chat Header */}
      <div className="bg-slate-900 text-white p-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black tracking-wide text-white">
                گروه مشترک اعلام بار و ترابری (Shared Dispatch Group)
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ۴ کاربر آنلاین
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              دید مشترک کلیه متصدیان • کنترل خودکار فرمت‌ها و ثبت در دیتابیس با فلگ Unpressed
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenFormatModal}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
            title="تنظیم فرمت‌های مجاز و قوانین اعتبارسنجی ربات"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تنظیم فرمت‌های مجاز</span>
            <span className="sm:hidden">قوانین</span>
          </button>

          {onRefreshMessages && (
            <button
              onClick={onRefreshMessages}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="بروزرسانی پیام‌های گروه"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClearChat}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="پاکسازی تاریخچه گفتگو"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Operator Switcher Bar */}
      <div className="bg-slate-800 text-slate-200 px-3 py-2 border-b border-slate-700 flex items-center justify-between gap-2 text-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-300">
          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>ارسال به عنوان:</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {PRESET_USERS.map((user) => {
            const isActive = currentUser.id === user.id;
            return (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs'
                    : 'bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: user.avatarColor }}
                ></span>
                <span>{user.name}</span>
                <span className="text-[9px] opacity-75">({user.role.split(' ')[0]})</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsCustomUserModal(true)}
            className="px-2 py-1 rounded-lg text-[11px] text-slate-300 bg-slate-700/50 hover:bg-slate-700 border border-dashed border-slate-500 transition cursor-pointer flex items-center gap-1"
            title="تعریف هویت اپراتور دیگر"
          >
            <Edit3 className="w-3 h-3" />
            <span>سایر...</span>
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/90">
        {/* Group Description Notice */}
        <div className="bg-white/90 border border-slate-200 rounded-xl p-3 shadow-2xs text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام نظارت هوشمند بر فرمت‌های گروه:</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            تمامی کاربران این گروه، پیام‌های یکدیگر را به صورت زنده مشاهده می‌کنند. <strong>ربات چت‌محور حذف شده است</strong> و سیستم هوشمند صرفاً دو رفتار دارد: در صورت رعایت فرمت، <strong>«کارت تاییدیه با فلگ پردازش‌نشده (Unpressed)»</strong> در دیتابیس ثبت می‌کند؛ و در صورت مغایرت فرمت (کد ملی، پلاک، شماره همراه)، <strong>«کارت اخطار مشخص»</strong> صادر می‌نماید.
          </p>
        </div>

        {/* Message List */}
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          const isApproved = msg.message_type === 'bot_approved';
          const isWarning = msg.message_type === 'bot_warning';
          const isCurrentUser = msg.user_id === currentUser.id;

          // 1. Render BOT APPROVED Card
          if (isBot && isApproved && msg.approved_info) {
            const info = msg.approved_info;
            return (
              <div key={msg.id} className="w-full max-w-xl mx-auto my-2 animate-in fade-in zoom-in-98 duration-200">
                <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-sm overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-emerald-50 px-3.5 py-2.5 border-b border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-black text-xs">
                        تاییدیه ثبت: اعلام بار با فلگ «پردازش‌نشده (Unpressed)» در دیتابیس ذخیره گردید
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Card Body with Key Specs */}
                  <div className="p-3.5 text-xs text-slate-800 space-y-2.5">
                    {/* Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold">شماره پیگیری سفر:</span>
                        <strong className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {info.trip_number || `سفر ${info.trip_id}#`}
                        </strong>
                      </div>

                      {/* Unpressed Status & Action */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                            info.is_unpressed
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              info.is_unpressed ? 'bg-amber-600' : 'bg-emerald-600'
                            }`}
                          ></span>
                          <span>{info.is_unpressed ? 'پردازش‌نشده (Unpressed)' : 'پردازش‌شده (Pressed)'}</span>
                        </span>

                        {onToggleUnpressed && (
                          <button
                            onClick={() => onToggleUnpressed(info.trip_id)}
                            className="text-[10px] text-slate-600 hover:text-slate-950 font-bold underline cursor-pointer"
                            title="تغییر وضعیت فلگ پردازش"
                          >
                            {info.is_unpressed ? 'تغییر به پردازش‌شده' : 'بازگردانی به پردازش‌نشده'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Extracted Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">راننده و مشخصات هویتی:</span>
                        <strong className="text-slate-900 block font-bold text-xs">{info.driver_name}</strong>
                        <div className="text-slate-600 mt-0.5 space-x-2 space-x-reverse font-mono text-[10px]">
                          {info.driver_national_id && <span>کد ملی: {info.driver_national_id}</span>}
                          {info.driver_mobile && <span>تلفن: {info.driver_mobile}</span>}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">ناوگان و پلاک:</span>
                        <strong className="text-slate-900 block font-bold text-xs font-mono">{info.license_plate}</strong>
                        {info.smart_fleet_number && (
                          <span className="text-slate-600 text-[10px] font-mono block">
                            کارت هوشمند: {info.smart_fleet_number}
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 col-span-full">
                        <span className="text-[10px] text-slate-500 block">مسیر و بارنامه:</span>
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-1 mt-0.5">
                          <span>{info.origin || 'مبدا نامشخص'}</span>
                          <span className="text-slate-400">←</span>
                          <span>{info.destination || 'مقصد نامشخص'}</span>
                          {info.announcement_number && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-sm mr-2 font-mono">
                              اعلامیه #{info.announcement_number}
                            </span>
                          )}
                        </div>
                        {(info.net_price || info.total_price) && (
                          <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-3">
                            {info.net_price && <span>صافی: <strong>{info.net_price}</strong></span>}
                            {info.total_price && <span>کل: <strong>{info.total_price}</strong></span>}
                            {info.commission && <span>کمیسیون: <strong>{info.commission}</strong></span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Link to Trips */}
                    {onNavigateToTrips && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={onNavigateToTrips}
                          className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          <span>مشاهده در زبانه سفرهای پایگاه داده</span>
                          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // 2. Render BOT WARNING Card
          if (isBot && isWarning) {
            return (
              <div key={msg.id} className="w-full max-w-xl mx-auto my-2 animate-in fade-in zoom-in-98 duration-200">
                <div className="bg-white rounded-2xl border-2 border-rose-500 shadow-sm overflow-hidden">
                  {/* Warning Header */}
                  <div className="bg-rose-50 px-3.5 py-2.5 border-b border-rose-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-black text-xs">{msg.text || '⚠️ اخطار: عدم انطباق با فرمت‌های مجاز'}</span>
                    </div>
                    <span className="text-[10px] text-rose-700 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Warning Reasons */}
                  <div className="p-3.5 text-xs text-slate-800 space-y-2">
                    <p className="text-[11px] text-slate-600">
                      پیام ارسالی به دلایل زیر با قوانین فرمت هماهنگ نیست و در پایگاه داده ثبت نگردید:
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-rose-800 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                      {(msg.warning_reasons || []).map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          }

          // 3. Render Regular USER / EMPLOYEE Chat Message
          const senderName = msg.user_name || (msg.sender === 'employee' ? 'همکار ترابری' : 'سیستم');
          const senderRole = msg.user_role || 'متصدی';
          const avatarColor = msg.avatar_color || (isCurrentUser ? '#f59e0b' : '#3b82f6');

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[92%] sm:max-w-[85%] ${
                isCurrentUser ? 'mr-auto flex-row-reverse' : 'ml-auto'
              }`}
            >
              {/* User Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs text-white font-bold text-xs"
                style={{ backgroundColor: avatarColor }}
              >
                {senderName.slice(0, 1)}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1 flex-1">
                {/* Header: Sender Name + Role Badge */}
                <div
                  className={`flex items-center gap-1.5 text-[11px] ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span className="font-bold text-slate-900">{senderName}</span>
                  <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-md font-medium">
                    {senderRole}
                  </span>
                  {isCurrentUser && (
                    <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md font-bold">
                      شما
                    </span>
                  )}
                </div>

                {/* Body */}
                <div
                  className={`rounded-2xl p-3 shadow-2xs text-xs whitespace-pre-wrap leading-relaxed select-text font-sans ${
                    isCurrentUser
                      ? 'bg-amber-500 text-slate-950 rounded-tl-xs font-medium'
                      : 'bg-white text-slate-800 rounded-tr-xs border border-slate-200'
                  }`}
                >
                  {msg.text}

                  {/* Timestamp */}
                  <div
                    className={`mt-1.5 flex items-center gap-1 text-[9px] ${
                      isCurrentUser ? 'text-slate-900/70 justify-end' : 'text-slate-400'
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 bg-white/90 border border-slate-200 rounded-2xl p-3 max-w-sm mx-auto text-xs text-slate-700 shadow-2xs">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[11px] font-medium">
              سیستم در حال ارزیابی فرمت‌های پیام و بررسی ثبت در دیتابیس...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Fast Templates */}
      <div className="px-3 py-2 bg-slate-200/90 border-t border-slate-300/80 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
        <span className="text-[11px] text-slate-600 font-bold flex items-center shrink-0 gap-1 pl-1">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          تست سریع نمونه‌ها:
        </span>
        {SAMPLE_TEMPLATES.map((tmpl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(tmpl.text)}
            className="text-xs bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-900 border border-slate-300 rounded-full px-3 py-1 font-medium transition cursor-pointer shrink-0 shadow-2xs active:scale-95"
          >
            {tmpl.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>
              در حال ارسال به گروه به عنوان:{' '}
              <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})
            </span>
            <button
              type="button"
              onClick={onOpenFormatModal}
              className="text-amber-600 hover:text-amber-700 font-bold underline cursor-pointer"
            >
              فرمت‌های مجاز
            </button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                id="group-chat-input"
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="متن پیام اعلام بار را بنویسید (در صورت صحت فرمت با فلگ Unpressed ثبت می‌شود)..."
                className="w-full resize-none px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden leading-relaxed placeholder:text-slate-400"
              />
            </div>

            <button
              id="btn-group-send"
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center"
              title="ارسال پیام به گروه"
            >
              <Send className="w-5 h-5 -scale-x-100" />
            </button>
          </div>
        </form>
      </div>

      {/* Custom User Identity Modal */}
      {isCustomUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full border border-slate-200 shadow-xl space-y-3" dir="rtl">
            <h3 className="text-xs font-bold text-slate-900">تعریف نام و نقش متصدی جهت ارسال پیام در گروه</h3>
            <form onSubmit={handleAddCustomUser} className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">نام و نام خانوادگی:</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثال: علی صادقی"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">عنوان شغلی / واحد:</label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="مثال: سرپرست نوبت‌دهی"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-hidden focus:border-amber-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomUserModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 cursor-pointer"
                >
                  تایید کاربر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
