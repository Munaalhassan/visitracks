export type VisitorCategory = 'guest' | 'contractor' | 'delivery' | 'interview' | 'vendor' | 'other';

export interface Building {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Host {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  building_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSession {
  id: string;
  session_date: string;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  notes: string | null;
  building_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Visitor {
  id: string;
  session_id: string;
  host_id: string | null;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  category: VisitorCategory;
  purpose: string | null;
  time_in: string;
  time_out: string | null;
  signature_verified: boolean;
  badge_number: string | null;
  remarks: string | null;
  building_id: string | null;
  created_at: string;
  updated_at: string;
  hosts?: Host | null;
}

export const VISITOR_CATEGORIES: { value: VisitorCategory; label: string }[] = [
  { value: 'guest', label: 'Guest' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'interview', label: 'Interview' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'other', label: 'Other' },
];
