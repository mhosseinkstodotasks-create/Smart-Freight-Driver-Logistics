import React from 'react';
import { MessageSquarePlus, Navigation, Users, Truck, Package, Database } from 'lucide-react';

export type NavTab = 'chat' | 'trips' | 'drivers' | 'fleets' | 'freights' | 'database';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingExtractionsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingExtractionsCount = 0,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'chat',
      label: 'ثبت هوشمند',
      icon: <MessageSquarePlus className="w-5 h-5" />,
      badge: pendingExtractionsCount,
    },
    {
      id: 'trips',
      label: 'سفرها',
      icon: <Navigation className="w-5 h-5" />,
    },
    {
      id: 'drivers',
      label: 'رانندگان',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'fleets',
      label: 'ناوگان',
      icon: <Truck className="w-5 h-5" />,
    },
    {
      id: 'freights',
      label: 'اعلام بار',
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: 'database',
      label: 'دیتابیس',
      icon: <Database className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg select-none"
    >
      <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-around px-1 py-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? 'scale-105' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
