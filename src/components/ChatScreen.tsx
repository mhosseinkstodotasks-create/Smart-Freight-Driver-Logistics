import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Paperclip,
  Mic,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Clock,
  Layers
} from 'lucide-react';
import { ChatMessage, ExtractedData } from '../types';
import { ChatExtractionCard } from './ChatExtractionCard';
import { EditExtractionModal } from './EditExtractionModal';
import { getPersianNow } from '../utils/persian';

interface ChatScreenProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onConfirmExtraction: (messageId: string, data: ExtractedData) => void;
  onUpdateExtractionData: (messageId: string, updatedData: ExtractedData) => void;
  onClearChat: () => void;
  isProcessing: boolean;
  isSaving: boolean;
}

const SAMPLE_CHIPS = [
  {
    label: '📋 بار کامل (اسماعیل حاتمی - ۲۴۹)',
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
    label: '🚛 بار دوم (کیسه جامبو میمه)',
    text: `اعلام بار 255 - نوع دوم
بنام مسعود عقراوی 09132668653 کدملی 1810567890
تریلی کفی 11ع125 ایران 13 شماره هوشمند 3982104
25 تن کیسه از کارخانه میمه به مرز خسروی
حواله شرکت بازرگانی مهرگان
صافی 44 م کل 51 م کمیسیون 500`,
  },
  {
    label: '⚠️ تست بار ناقص (بدون پلاک)',
    text: `اعلامیه 260 بنام علی اقبالی 09145769715 از نجف آباد به چذابه حواله پالت کاشی نیلو صافی 48 م`,
  },
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  onSendMessage,
  onConfirmExtraction,
  onUpdateExtractionData,
  onClearChat,
  isProcessing,
  isSaving,
}) => {
  const [inputText, setInputText] = useState('');
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
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
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleUseChip = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto bg-slate-100 relative">
      {/* Top action / info bar */}
      <div className="px-4 py-2 bg-slate-200/80 border-b border-slate-300/80 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
          <span>ربات هوشمند استخراج متن اعلام بار (ChatGPT / Gemini)</span>
        </div>
        <button
          onClick={onClearChat}
          className="text-slate-500 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
          title="پاکسازی تاریخچه گفتگو"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>پاکسازی گفتگو</span>
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message */}
        <div className="flex gap-2.5 max-w-[90%]">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-white rounded-2xl rounded-tr-xs p-3.5 border border-slate-200 shadow-xs text-slate-800 text-xs leading-relaxed space-y-2">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>سامانه هوشمند ثبت بار و راننده</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </p>
            <p>
              همکار گرامی، می‌توانید اطلاعات اعلام بار یا راننده را به صورت متن عادی (مانند پیام‌های تلگرام، واتساپ یا ایتا) در کادر زیر ارسال کنید.
            </p>
            <p className="text-slate-500">
              سیستم به طور خودکار اطلاعات راننده، ناوگان، اعلام بار و مسیر را استخراج کرده و پس از تأیید شما، در پایگاه داده MySQL ذخیره خواهد کرد.
            </p>
          </div>
        </div>

        {/* Message Items */}
        {messages.map((msg) => {
          const isEmployee = msg.sender === 'employee';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isEmployee ? 'flex-row-reverse self-end' : 'self-start max-w-[95%]'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs text-xs font-bold ${
                  isEmployee
                    ? 'bg-slate-800 text-amber-400'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                {isEmployee ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 shadow-xs ${
                  isEmployee
                    ? 'bg-amber-500 text-slate-950 rounded-tl-xs font-medium'
                    : 'bg-white text-slate-800 rounded-tr-xs border border-slate-200'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap text-xs leading-relaxed font-sans select-text">
                  {msg.text}
                </div>

                {/* Structured Extraction Card (if attached to AI response) */}
                {msg.extracted && (
                  <ChatExtractionCard
                    extracted={msg.extracted}
                    duplicates={msg.duplicates}
                    status={msg.status}
                    savedTripNumber={msg.savedTripNumber}
                    onConfirm={() => onConfirmExtraction(msg.id, msg.extracted!)}
                    onEdit={() => setEditingMessage(msg)}
                    isSaving={isSaving}
                  />
                )}

                {/* Timestamp */}
                <div
                  className={`mt-1.5 flex items-center gap-1 text-[10px] ${
                    isEmployee ? 'text-slate-800/80 justify-end' : 'text-slate-400'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* AI Typing / Processing Indicator */}
        {isProcessing && (
          <div className="flex gap-2.5 self-start items-center">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tr-xs border border-slate-200 shadow-xs flex items-center gap-2 text-xs text-slate-600">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="mr-1">هوش مصنوعی در حال تحلیل و استخراج اطلاعات بار...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Chips Bar */}
      <div className="px-3 py-2 bg-slate-200/90 border-t border-slate-300/80 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
        <span className="text-[11px] text-slate-500 font-bold flex items-center shrink-0 gap-1 pl-1">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          پیام‌های نمونه:
        </span>
        {SAMPLE_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleUseChip(chip.text)}
            className="text-xs bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-900 border border-slate-300 rounded-full px-3 py-1 font-medium transition cursor-pointer shrink-0 shadow-2xs active:scale-95"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <div className="p-3 bg-white border-t border-slate-200 shadow-lg">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          {/* Audio mic simulation button */}
          <button
            type="button"
            title="ضبط پیام صوتی (ویس)"
            onClick={() => alert('امکان ضبط مستقیم وویس راننده برای استخراج متن فعال است.')}
            className="p-2.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              id="chat-message-input"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="متن پیام بار یا راننده را اینجا بنویسید یا از پیام‌های بالا جایگذاری کنید..."
              className="w-full resize-none px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden leading-relaxed placeholder:text-slate-400"
            />
          </div>

          {/* Send button */}
          <button
            id="btn-send-message"
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="p-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="ارسال پیام جهت استخراج"
          >
            <Send className="w-5 h-5 -scale-x-100" />
          </button>
        </form>
      </div>

      {/* Edit Extraction Modal */}
      {editingMessage && editingMessage.extracted && (
        <EditExtractionModal
          isOpen={true}
          data={editingMessage.extracted}
          onClose={() => setEditingMessage(null)}
          onSave={(updatedData) => {
            onUpdateExtractionData(editingMessage.id, updatedData);
            setEditingMessage(null);
          }}
        />
      )}
    </div>
  );
};
