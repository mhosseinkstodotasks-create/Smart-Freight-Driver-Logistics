import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { ChatScreen } from './components/ChatScreen';
import { TripsScreen } from './components/TripsScreen';
import { DriversScreen } from './components/DriversScreen';
import { FleetsScreen } from './components/FleetsScreen';
import { FreightsScreen } from './components/FreightsScreen';
import { DatabaseMappingModal } from './components/DatabaseMappingModal';
import { FormatSettingsModal } from './components/FormatSettingsModal';
import {
  Driver,
  Fleet,
  FreightAnnouncement,
  Trip,
  ChatMessage,
  SchemaMappingConfig,
  FormatConfig,
  defaultFormatConfig,
  GroupUser,
} from './types';
import {
  initialDrivers,
  initialFleets,
  initialFreights,
  initialTrips,
  defaultSchemaMapping,
} from './data/mockData';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Entities state
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [fleets, setFleets] = useState<Fleet[]>(initialFleets);
  const [freights, setFreights] = useState<FreightAnnouncement[]>(initialFreights);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [mapping, setMapping] = useState<SchemaMappingConfig>(defaultSchemaMapping);
  const [formatConfig, setFormatConfig] = useState<FormatConfig>(defaultFormatConfig);

  // Group Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data from server
  const loadServerData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch group messages
      const msgRes = await fetch('/api/group-messages');
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        if (Array.isArray(msgData.messages)) {
          setMessages(msgData.messages);
        }
      }

      // 2. Fetch format rules
      const rulesRes = await fetch('/api/format-rules');
      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        if (rulesData.success && rulesData.formatConfig) {
          setFormatConfig(rulesData.formatConfig);
        }
      }

      // 3. Fetch trips
      const tripsRes = await fetch('/api/trips');
      if (tripsRes.ok) {
        const tripsData = await tripsRes.json();
        if (tripsData.items && tripsData.items.length > 0) {
          setTrips(tripsData.items);
        }
      }

      // 4. Fetch freights
      const freightsRes = await fetch('/api/freights');
      if (freightsRes.ok) {
        const freightsData = await freightsRes.json();
        if (freightsData.items && freightsData.items.length > 0) {
          setFreights(freightsData.items);
        }
      }

      // 5. Fetch drivers
      const driversRes = await fetch('/api/drivers');
      if (driversRes.ok) {
        const driversData = await driversRes.json();
        if (driversData.items && driversData.items.length > 0) {
          setDrivers(driversData.items);
        }
      }

      // 6. Fetch fleets
      const fleetsRes = await fetch('/api/fleets');
      if (fleetsRes.ok) {
        const fleetsData = await fleetsRes.json();
        if (fleetsData.items && fleetsData.items.length > 0) {
          setFleets(fleetsData.items);
        }
      }
    } catch (e) {
      console.warn('Backend fetch error or offline, fallback to mock state:', e);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadServerData();
  }, [loadServerData]);

  // Handle employee sending a new message into the group chat
  const handleSendMessage = async (text: string, user: GroupUser) => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/group-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          user_id: user.id,
          user_name: user.name,
          user_role: user.role,
          avatar_color: user.avatarColor,
        }),
      });

      const resData = await response.json();

      if (resData.success) {
        // Append user message & bot message
        setMessages((prev) => {
          const next = [...prev, resData.userMessage];
          if (resData.botMessage) {
            next.push(resData.botMessage);
          }
          return next;
        });

        if (resData.is_approved && resData.trip) {
          // Prepend new trip to list
          setTrips((prev) => [resData.trip, ...prev]);

          if (resData.trip.driver) {
            setDrivers((prev) => {
              const exists = prev.some((d) => d.id === resData.trip.driver.id);
              return exists ? prev : [resData.trip.driver, ...prev];
            });
          }
          if (resData.trip.fleet) {
            setFleets((prev) => {
              const exists = prev.some((f) => f.id === resData.trip.fleet.id);
              return exists ? prev : [resData.trip.fleet, ...prev];
            });
          }
          if (resData.trip.freight) {
            setFreights((prev) => {
              const exists = prev.some((fr) => fr.id === resData.trip.freight.id);
              return exists ? prev : [resData.trip.freight, ...prev];
            });
          }

          showToast('✅ اطلاعات اعلام بار تایید شد و با وضعیت «پردازش‌نشده (Unpressed)» در دیتابیس ذخیره گردید.');
        } else {
          showToast('⚠️ اخطار: اطلاعات ارسالی با فرمت‌های مجاز همخوانی ندارد.');
        }
      } else {
        throw new Error(resData.error || 'خطا در ثبت پیام');
      }
    } catch (err: any) {
      console.error('Group chat send error:', err);
      showToast(`خطا در ارتباط با سرور: ${err.message || 'نامشخص'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Unpressed flag for a trip
  const handleToggleUnpressed = async (tripId: number) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/toggle-unpressed`, {
        method: 'PATCH',
      });
      const data = await response.json();

      if (data.success) {
        const nextUnpressed = data.is_unpressed;

        // Update trips
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, is_unpressed: nextUnpressed } : t))
        );

        // Update freights
        setFreights((prev) =>
          prev.map((fr) => {
            const matchedTrip = trips.find((t) => t.id === tripId);
            if (matchedTrip && matchedTrip.freight_id === fr.id) {
              return { ...fr, is_unpressed: nextUnpressed };
            }
            return fr;
          })
        );

        // Update messages
        setMessages((prev) =>
          prev.map((m) => {
            if (m.approved_info && m.approved_info.trip_id === tripId) {
              return {
                ...m,
                approved_info: {
                  ...m.approved_info,
                  is_unpressed: nextUnpressed,
                },
              };
            }
            return m;
          })
        );

        showToast(
          nextUnpressed
            ? `وضعیت سفر به «پردازش‌نشده (Unpressed)» تغییر یافت.`
            : `سفر به عنوان «پردازش‌شده (Pressed)» علامت‌گذاری شد.`
        );
      }
    } catch (err: any) {
      console.error('Failed to toggle unpressed:', err);
      showToast('خطا در تغییر وضعیت پردازش سفر');
    }
  };

  // Save Format Rules
  const handleSaveFormatRules = async (newConfig: FormatConfig) => {
    try {
      const res = await fetch('/api/format-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formatConfig: newConfig }),
      });
      const data = await res.json();
      if (data.success) {
        setFormatConfig(data.formatConfig);
        showToast('قوانین فرمت‌های مجاز با موفقیت ذخیره شد.');
      }
    } catch (e) {
      console.error('Error saving format rules:', e);
      setFormatConfig(newConfig);
      showToast('قوانین فرمت‌های مجاز ذخیره شد.');
    }
  };

  // Clear Chat
  const handleClearChat = async () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام پیام‌های گروه پاکسازی شوند؟')) {
      try {
        await fetch('/api/group-messages', { method: 'DELETE' });
      } catch (e) {
        console.warn('Failed to clear on server:', e);
      }
      setMessages([]);
      showToast('پیام‌های گروه پاکسازی شدند.');
    }
  };

  const unpressedCount = trips.filter((t) => t.is_unpressed === true).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950" dir="rtl">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenFormatModal={() => setIsFormatModalOpen(true)}
        onRefreshData={loadServerData}
        isLoading={isLoadingData}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-2 sm:p-4">
        {activeTab === 'chat' && (
          <ChatScreen
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onRefreshMessages={loadServerData}
            onOpenFormatModal={() => setIsFormatModalOpen(true)}
            onToggleUnpressed={handleToggleUnpressed}
            onNavigateToTrips={() => setActiveTab('trips')}
            isProcessing={isProcessing}
          />
        )}

        {activeTab === 'trips' && (
          <TripsScreen
            trips={trips}
            onNewTripClick={() => setActiveTab('chat')}
            onToggleUnpressed={handleToggleUnpressed}
          />
        )}

        {activeTab === 'drivers' && <DriversScreen drivers={drivers} />}

        {activeTab === 'fleets' && <FleetsScreen fleets={fleets} />}

        {activeTab === 'freights' && (
          <FreightsScreen freights={freights} onToggleUnpressed={handleToggleUnpressed} />
        )}

        {activeTab === 'database' && (
          <div className="p-4">
            <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">آداپتور پایگاه داده و نگاشت جداول MySQL</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                تمام فایل‌های لایه Repository و آداپتور پایگاه داده PHP و اسکریپت‌های بازرسی در پوشه <code>php_backend/</code> مستقر و با دیتابیس MySQL یکپارچه هستند. تمامی اطلاعات جدید با فلگ <code>is_unpressed: true</code> ذخیره می‌گردند.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setIsDbModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
                >
                  مشاهده نگاشت جداول دیتابیس
                </button>
                <button
                  onClick={() => setIsFormatModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
                >
                  تنظیم فرمت‌های مجاز
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingExtractionsCount={unpressedCount}
      />

      {/* Format Settings Modal */}
      <FormatSettingsModal
        isOpen={isFormatModalOpen}
        onClose={() => setIsFormatModalOpen(false)}
        config={formatConfig}
        onSaveConfig={handleSaveFormatRules}
      />

      {/* Database Schema & Inspection Modal */}
      <DatabaseMappingModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        mapping={mapping}
        onUpdateMapping={(newMap) => {
          setMapping(newMap);
          showToast('نگاشت جداول دیتابیس بروزرسانی شد.');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
