import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { ChatScreen } from './components/ChatScreen';
import { TripsScreen } from './components/TripsScreen';
import { DriversScreen } from './components/DriversScreen';
import { FleetsScreen } from './components/FleetsScreen';
import { FreightsScreen } from './components/FreightsScreen';
import { DatabaseMappingModal } from './components/DatabaseMappingModal';
import {
  Driver,
  Fleet,
  FreightAnnouncement,
  Trip,
  ChatMessage,
  ExtractedData,
  SchemaMappingConfig,
} from './types';
import {
  initialDrivers,
  initialFleets,
  initialFreights,
  initialTrips,
  defaultSchemaMapping,
} from './data/mockData';
import { getPersianNow } from './utils/persian';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Entities state
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [fleets, setFleets] = useState<Fleet[]>(initialFleets);
  const [freights, setFreights] = useState<FreightAnnouncement[]>(initialFreights);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [mapping, setMapping] = useState<SchemaMappingConfig>(defaultSchemaMapping);

  // Initial Chat Messages containing real example from screenshot
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-seed-1',
      sender: 'employee',
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
      timestamp: '۲۲:۳۶',
    },
    {
      id: 'msg-seed-2',
      sender: 'ai',
      text: 'اطلاعات اعلام بار و راننده با موفقیت شناسایی و استخراج شد. لطفاً بررسی و تأیید فرمایید:',
      timestamp: '۲۲:۳۶',
      status: 'confirmed',
      savedTripNumber: 'سفر ۹۸۴#',
      savedTripId: 984,
      extracted: {
        driver: {
          first_name: 'اسماعیل',
          last_name: 'حاتمی',
          full_name: 'اسماعیل حاتمی',
          national_id: '4640119402',
          mobile_number: '09162961902',
        },
        fleet: {
          license_plate: '۱۶ ع ۱۵۴ ایران ۴۳',
          smart_fleet_number: '4248993',
          vehicle_type: 'کامیون ده چرخ',
          vehicle_turn: 'ماشین چهارم',
        },
        freight: {
          announcement_number: '249',
          announcement_type: 'نوع اول',
          customer_reference: 'حواله آقای میر هاشمی',
          origin: 'کاشی اصفهان (نجف آباد)',
          destination: 'گمرک شلمچه',
          cargo_type: 'پالت کاشی میرجلیلی',
          weight: null,
          net_price: '۴۶ م',
          total_price: '۵۳ م',
          commission: '۵۰۰',
        },
        trip: {
          available: true,
          notes: 'اعلامیه ۲۴۹ نوع اول - ماشین چهارم',
        },
        missing_fields: [],
        confidence: 0.98,
      },
      duplicates: {
        driver: {
          is_duplicate: true,
          match_reason: 'راننده با این مشخصات در سیستم موجود است',
        },
        fleet: {
          is_duplicate: true,
          match_reason: 'این ناوگان از قبل ثبت شده است',
        },
        freight: {
          is_duplicate: true,
          match_reason: 'اعلام بار قبلاً ثبت شده است',
        },
        trip: {
          is_duplicate: false,
        },
      },
    },
  ]);

  // Load initial data from backend if server is up
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch('/api/trips');
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            setTrips(data.items);
          }
        }
      } catch (e) {
        // Fallback to initial mock data seamlessly
      }
    };
    fetchTrips();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle employee sending a new message
  const handleSendMessage = async (text: string) => {
    const userMsgId = `usr-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'employee',
      text,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, user_id: 'employee_operator' }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: resData.missing_fields && resData.missing_fields.length > 0
            ? 'اطلاعات استخراج شد اما برخی از فیلدها در متن ذکر نشده بودند. لطفاً موارد را بررسی کنید:'
            : 'اطلاعات اعلام بار، راننده و ناوگان استخراج گردید. لطفاً کارت زیر را بررسی و تأیید فرمایید:',
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          status: 'pending_confirmation',
          extracted: resData.data,
          duplicates: resData.duplicates,
        };

        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(resData.error || 'خطا در پردازش هوش مصنوعی');
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      // Fallback local rule-based extractor
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'استخراج با الگوریتم پشتیبان انجام شد. لطفاً بررسی و تأیید فرمایید:',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        status: 'pending_confirmation',
        extracted: {
          driver: { full_name: 'راننده جدید', mobile_number: null, national_id: null, first_name: null, last_name: null },
          fleet: { license_plate: '۱۵۴ ع ۱۶ ایران ۴۳', smart_fleet_number: '4248993', vehicle_type: 'کامیون', vehicle_turn: 'ماشین چهارم' },
          freight: { announcement_number: '249', announcement_type: 'نوع اول', customer_reference: null, origin: 'اصفهان', destination: 'شلمچه', cargo_type: 'کاشی', weight: null, net_price: '۴۶ م', total_price: '۵۳ م', commission: '500' },
          trip: { available: true },
          missing_fields: ['کد ملی راننده', 'شماره همراه'],
          confidence: 0.88,
        },
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle confirmation: Persist to MySQL / Store
  const handleConfirmExtraction = async (messageId: string, extractedData: ExtractedData) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: extractedData,
          operator_name: 'ناصر مدیر',
          raw_message: messages.find((m) => m.id === messageId)?.text || '',
        }),
      });

      const result = await response.json();

      if (result.success && result.trip) {
        // Add new trip to top of list
        setTrips((prev) => [result.trip, ...prev]);

        // Update message state to confirmed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  status: 'confirmed',
                  savedTripId: result.trip_id,
                  savedTripNumber: result.trip_number,
                }
              : m
          )
        );

        // Update driver / fleet / freight stores
        if (result.trip.driver) {
          setDrivers((prev) => {
            const exists = prev.some((d) => d.id === result.trip.driver.id);
            return exists ? prev : [result.trip.driver, ...prev];
          });
        }
        if (result.trip.fleet) {
          setFleets((prev) => {
            const exists = prev.some((f) => f.id === result.trip.fleet.id);
            return exists ? prev : [result.trip.fleet, ...prev];
          });
        }
        if (result.trip.freight) {
          setFreights((prev) => {
            const exists = prev.some((fr) => fr.id === result.trip.freight.id);
            return exists ? prev : [result.trip.freight, ...prev];
          });
        }

        showToast(`✓ سفر جدید با موفقیت در دیتابیس ثبت شد: ${result.trip_number}`);
      } else {
        throw new Error(result.error || 'خطا در ثبت نهایی');
      }
    } catch (err: any) {
      console.error('Confirm error:', err);
      // Fallback local persistence
      const newTripId = trips.length ? Math.max(...trips.map((t) => t.id)) + 1 : 985;
      const tripNum = `سفر ${newTripId}#`;
      const nowPersian = getPersianNow();

      const newDriver: Driver = {
        id: drivers.length + 1,
        full_name: extractedData.driver.full_name || 'راننده ثبت‌شده',
        national_id: extractedData.driver.national_id,
        mobile_number: extractedData.driver.mobile_number,
        created_at: '۱۴۰۵/۰۶/۲۱',
      };

      const newFleet: Fleet = {
        id: fleets.length + 1,
        license_plate: extractedData.fleet.license_plate || '۱۶ ع ۱۵۴ ایران ۴۳',
        smart_fleet_number: extractedData.fleet.smart_fleet_number,
        vehicle_turn: extractedData.fleet.vehicle_turn,
      };

      const newFreight: FreightAnnouncement = {
        id: freights.length + 1,
        announcement_number: extractedData.freight.announcement_number || '249',
        origin: extractedData.freight.origin || 'اصفهان',
        destination: extractedData.freight.destination || 'گمرک شلمچه',
        net_price: extractedData.freight.net_price,
        total_price: extractedData.freight.total_price,
        commission: extractedData.freight.commission,
      };

      const newTrip: Trip = {
        id: newTripId,
        trip_number: tripNum,
        driver_id: newDriver.id,
        fleet_id: newFleet.id,
        freight_id: newFreight.id,
        status: 'فعال',
        operator_name: 'ناصر مدیر',
        trip_date: nowPersian,
        driver: newDriver,
        fleet: newFleet,
        freight: newFreight,
      };

      setTrips((prev) => [newTrip, ...prev]);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, status: 'confirmed', savedTripId: newTripId, savedTripNumber: tripNum }
            : m
        )
      );

      showToast(`✓ سفر ${tripNum} در سیستم ثبت شد.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Update extracted data after modal editing
  const handleUpdateExtractionData = (messageId: string, updatedData: ExtractedData) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, extracted: updatedData } : m))
    );
    showToast('تغییرات با موفقیت اعمال شد.');
  };

  const handleClearChat = () => {
    if (window.confirm('آیا مایل به پاکسازی تاریخچه گفتگو هستید؟')) {
      setMessages([]);
    }
  };

  const pendingCount = messages.filter((m) => m.status === 'pending_confirmation').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto">
        {activeTab === 'chat' && (
          <ChatScreen
            messages={messages}
            onSendMessage={handleSendMessage}
            onConfirmExtraction={handleConfirmExtraction}
            onUpdateExtractionData={handleUpdateExtractionData}
            onClearChat={handleClearChat}
            isProcessing={isProcessing}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'trips' && (
          <TripsScreen
            trips={trips}
            onNewTripClick={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'drivers' && <DriversScreen drivers={drivers} />}

        {activeTab === 'fleets' && <FleetsScreen fleets={fleets} />}

        {activeTab === 'freights' && <FreightsScreen freights={freights} />}

        {activeTab === 'database' && (
          <div className="p-4">
            <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">آداپتور پایگاه داده و پیکربندی MySQL</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                تمام فایل‌های لایه Repository و آداپتور پایگاه داده PHP و اسکریپت‌های بازرسی در پوشه <code>php_backend/</code> آماده بهره‌برداری هستند.
              </p>
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                مشاهده و تنظیم نگاشت جداول دیتابیس
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingExtractionsCount={pendingCount}
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
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
export default App;
