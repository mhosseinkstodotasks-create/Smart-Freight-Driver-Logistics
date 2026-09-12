/**
 * Core Data Models & TypeScript Types
 * Supports Persian Logistics System
 */

export interface Driver {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  full_name: string;
  national_id?: string | null;
  mobile_number?: string | null;
  score?: number;
  created_at?: string;
  trip_count?: number;
}

export interface Fleet {
  id: number;
  license_plate: string;
  smart_fleet_number?: string | null;
  vehicle_type?: string;
  vehicle_turn?: string | null;
  created_at?: string;
}

export interface FreightAnnouncement {
  id: number;
  announcement_number: string;
  announcement_type?: string;
  customer_reference?: string | null;
  origin: string;
  destination: string;
  cargo_type?: string;
  weight?: string | null;
  net_price?: string | null;    // صافی (کرایه دریافتی راننده)
  total_price?: string | null;  // کل (کرایه کل)
  commission?: string | null;   // کمیسیون
  bill_of_lading_company?: string;
  agent_name?: string;
  is_unpressed?: boolean;       // Unpressed flag (ثبت اولیه بدون پردازش / unpressed)
  created_at?: string;
}

export interface Trip {
  id: number;
  trip_number: string;
  driver_id: number;
  fleet_id: number;
  freight_id: number;
  status: 'فعال' | 'لغو سفر' | 'رزرو' | 'بارنامه صادر شده';
  is_unpressed: boolean;        // Flag: true = unpressed (پردازش‌نشده), false = pressed (پردازش‌شده)
  operator_name: string;
  trip_date: string;
  notes?: string;
  created_at?: string;
  driver?: Driver;
  fleet?: Fleet;
  freight?: FreightAnnouncement;
}

export interface GroupUser {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  department?: string;
}

export const defaultFormatConfig: FormatConfig = {
  national_id: {
    enabled: true,
    required: true,
    strictChecksum: true,
    pattern: '^\\d{10}$',
    errorMessage: 'کد ملی راننده باید ۱۰ رقمی معتبر با فرمت الگوریتم رسمی کشور باشد',
  },
  license_plate: {
    enabled: true,
    required: true,
    requireCommercialLetter: true,
    pattern: '^\\d{2,3}[\\s]?[عک][\\s]?\\d{2,3}[\\s]?(ایران)?[\\s]?\\d{2}$',
    errorMessage: 'پلاک ناوگان باید پلاک باری/ترابری ایران (دارای حرف «ع» یا «ک» با کد ایران) باشد',
  },
  smart_fleet_number: {
    enabled: true,
    required: false,
    minDigits: 6,
    maxDigits: 8,
    errorMessage: 'شماره کارت هوشمند ناوگان باید عددی ۶ الی ۸ رقمی باشد',
  },
  mobile_number: {
    enabled: true,
    required: true,
    pattern: '^09\\d{9}$',
    errorMessage: 'شماره همراه راننده باید ۱۱ رقم و با ۰۹ شروع شود',
  },
  announcement_number: {
    enabled: true,
    required: true,
    pattern: '^\\d{1,6}$',
    errorMessage: 'شماره اعلام بار معتبر الزامی است',
  },
  route: {
    enabled: true,
    required: true,
    errorMessage: 'ذکر مبدا و مقصد بار الزامی است',
  },
  prices: {
    enabled: false,
    required: false,
    errorMessage: 'مبالغ کرایه صافی و کل الزامی است',
  },
};

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  required: boolean;
  pattern?: string;
  errorMessage: string;
  category: 'driver' | 'fleet' | 'freight' | 'route';
  example: string;
  strictChecksum?: boolean;
}

export interface FormatConfig {
  national_id: {
    enabled: boolean;
    required: boolean;
    strictChecksum: boolean;
    pattern: string;
    errorMessage: string;
  };
  license_plate: {
    enabled: boolean;
    required: boolean;
    requireCommercialLetter: boolean; // Requires 'ع' or 'ک'
    pattern: string;
    errorMessage: string;
  };
  smart_fleet_number: {
    enabled: boolean;
    required: boolean;
    minDigits: number;
    maxDigits: number;
    errorMessage: string;
  };
  mobile_number: {
    enabled: boolean;
    required: boolean;
    pattern: string;
    errorMessage: string;
  };
  announcement_number: {
    enabled: boolean;
    required: boolean;
    pattern: string;
    errorMessage: string;
  };
  route: {
    enabled: boolean;
    required: boolean;
    errorMessage: string;
  };
  prices: {
    enabled: boolean;
    required: boolean;
    errorMessage: string;
  };
}

export interface ExtractedData {
  driver: {
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    mobile_number: string | null;
    national_id: string | null;
  };
  fleet: {
    license_plate: string | null;
    smart_fleet_number: string | null;
    vehicle_type: string | null;
    vehicle_turn: string | null;
  };
  freight: {
    announcement_number: string | null;
    announcement_type: string | null;
    customer_reference: string | null;
    origin: string | null;
    destination: string | null;
    cargo_type: string | null;
    weight: string | null;
    net_price: string | null;
    total_price: string | null;
    commission: string | null;
  };
  trip: {
    available: boolean;
    notes?: string | null;
  };
  missing_fields: string[];
  confidence: number;
}

export interface DuplicateAnalysis {
  driver: {
    is_duplicate: boolean;
    existing_record?: Driver | null;
    match_reason?: string | null;
  };
  fleet: {
    is_duplicate: boolean;
    existing_record?: Fleet | null;
    match_reason?: string | null;
  };
  freight: {
    is_duplicate: boolean;
    existing_record?: FreightAnnouncement | null;
    match_reason?: string | null;
  };
  trip: {
    is_duplicate: boolean;
    existing_record?: Trip | null;
    match_reason?: string | null;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'employee' | 'ai' | 'user' | 'bot';
  text: string;
  timestamp: string;
  // Group chat user details
  user_id?: string;
  user_name?: string;
  user_role?: string;
  avatar_color?: string;
  
  // Message classification
  message_type?: 'user_freight' | 'bot_approved' | 'bot_warning' | 'system';
  
  // Bot responses (strictly only approved info or warning regarding unacceptable formats)
  warning_reasons?: string[];
  approved_info?: {
    trip_id: number;
    trip_number: string;
    is_unpressed: boolean;
    driver_name: string;
    driver_national_id?: string | null;
    driver_mobile?: string | null;
    license_plate?: string | null;
    smart_fleet_number?: string | null;
    announcement_number?: string | null;
    origin?: string | null;
    destination?: string | null;
    net_price?: string | null;
    total_price?: string | null;
    commission?: string | null;
    timestamp: string;
  };

  extracted?: ExtractedData;
  duplicates?: DuplicateAnalysis;
  status?: 'pending_confirmation' | 'confirmed' | 'cancelled';
  savedTripId?: number;
  savedTripNumber?: string;
  isProcessing?: boolean;
  error?: string;
}

export interface SchemaMappingConfig {
  tables: {
    drivers: string;
    fleets: string;
    freights: string;
    trips: string;
    chat_history: string;
  };
  columns: {
    drivers: Record<string, string>;
    fleets: Record<string, string>;
    freights: Record<string, string>;
    trips: Record<string, string>;
  };
}
