// Shared shapes returned by the backend, used across the api/ layer so
// every caller gets the same types instead of each file re-declaring them.

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: "employee" | "administrator";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CategorySpec {
  id: number;
  category_id: number;
  spec_name: string;
  spec_type: "text" | "number" | "boolean" | "dropdown";
  is_required: boolean;
}

export interface Category {
  id: number;
  name: string;
  specs: CategorySpec[];
}

export interface Department {
  id: number;
  name: string;
  is_active: boolean;
}

export type AssetStatus =
  | "available"
  | "assigned"
  | "under_repair"
  | "retired"
  | "disposed";

export type AssetCondition = "new" | "good" | "fair" | "damaged";

export interface Asset {
  id: number;
  asset_tag: string;
  name: string;
  brand: string | null;
  category_id: number;
  category_name: string;
  purchase_date: string | null;
  purchase_cost: number | null;
  status: AssetStatus;
  condition: AssetCondition;
  usage_state: string;
  current_assignee_id: number | null;
  current_assignee_name: string | null;
  created_at: string;
  updated_at: string;
  disposed_at: string | null;
}

export interface AssetHistoryEntry {
  id: number;
  performed_by: number | null;
  performed_by_name: string | null;
  event_type: string;
  description: string;
  asset_id: number;
  created_at: string;
}

export interface AssetDocument {
  id: number;
  asset_id: number;
  document_type: "receipt" | "repair_record" | "other";
  file_url: string;
  uploaded_by: number | null;
  uploaded_by_name: string | null;
  created_at: string;
}

export interface AssetDetail extends Asset {
  history: AssetHistoryEntry[];
  documents: AssetDocument[];
  spec_values: {
    id: number;
    category_spec_id: number;
    value: string;
    spec_name: string;
    spec_type: string;
  }[];
}

export interface PaginatedAssets {
  data: Asset[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AssetStats {
  total: number;
  byStatus: Record<AssetStatus, number>;
  byCondition: Record<AssetCondition, number>;
}

// A lighter asset shape — this is what comes back nested inside a profile's
// assigned_assets, not the full Asset row.
export interface AssignedAssetSummary {
  id: number;
  asset_tag: string;
  name: string;
  status: AssetStatus;
  condition: AssetCondition;
}

export interface MyProfile {
  id: number;
  full_name: string;
  email: string;
  role: "employee" | "administrator";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  departments: { id: number; name: string }[];
  assigned_assets: AssignedAssetSummary[];
}

export interface Employee {
  id: number;
  full_name: string;
  email: string;
  role: "employee" | "administrator";
  is_active: boolean;
}

// requests.status_at_time/repair_details etc. come straight off the
// `requests` table (r.*) plus a few joined display names — this covers
// the fields every endpoint in requestController.js actually selects, but
// wasn't reverse-engineered from the DB schema directly, so treat it as a
// best-effort shape rather than gospel if something's missing.
export interface RequestRecord {
  id: number;
  employee_id: number;
  request_type: "asset" | "return" | "repair";
  category_id: number | null;
  category_name: string | null;
  asset_id: number | null;
  asset_name: string | null;
  asset_tag: string | null;
  status: string;
  reason: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  completed_at: string | null;
  completed_by: number | null;
  acknowledged_at: string | null;
  created_at: string;
}

export interface Acknowledgement {
  asset_id: number;
  name: string;
  category_name: string | null;
  condition: AssetCondition;
  is_active: boolean;
  assigned_at: string;
  assigned_by_name: string | null;
  acknowledged_at: string | null;
  returned_at: string | null;
}

export interface RequestNote {
  id: number;
  note: string;
  status_at_time: string;
  created_at: string;
  admin_name: string | null;
}
