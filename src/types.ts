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
  created_at?: string;
}

export interface Trip {
  id: number;
  trip_number: string;
  driver_id: number;
  fleet_id: number;
  freight_id: number;
  status: 'فعال' | 'لغو سفر' | 'رزرو' | 'بارنامه صادر شده';
  operator_name: string;
  trip_date: string;
  notes?: string;
  created_at?: string;
  driver?: Driver;
  fleet?: Fleet;
  freight?: FreightAnnouncement;
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
  sender: 'employee' | 'ai';
  text: string;
  timestamp: string;
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
