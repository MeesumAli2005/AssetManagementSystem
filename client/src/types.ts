// Shared shapes returned by the backend, used across the api/ layer so
// every caller gets the same types instead of each file re-declaring them.
//
// Grounded directly in database/asset_management.sql's CREATE TABLE
// statements, not guessed from the JS controllers. Two things the DDL
// makes clear that aren't obvious from reading the backend code at all:
//   - tinyint(1) columns (is_active, is_required) come back as JS `number`
//     (0/1), not `boolean` — mysql2 doesn't auto-convert these unless you
//     configure it to, and db.js doesn't.
//   - decimal(10,2) columns (purchase_cost) come back as `string`, not
//     `number` — mysql2's default, to avoid float rounding on money.

export interface User {
  id: number;
  full_name: string | null;
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
  is_required: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  specs: CategorySpec[];
}

export interface Department {
  id: number;
  name: string;
  is_active: number;
  created_at: string;
}

export type AssetStatus =
  | "available"
  | "assigned"
  | "under_repair"
  | "retired"
  | "disposed";

export type AssetCondition = "new" | "good" | "fair" | "damaged";
export type AssetUsageState = "active" | "dormant";

export interface Asset {
  id: number;
  asset_tag: string;
  name: string | null;
  brand: string | null;
  category_id: number;
  category_name: string;
  purchase_date: string | null;
  purchase_cost: string | null;
  status: AssetStatus;
  condition: AssetCondition;
  usage_state: AssetUsageState;
  current_assignee_id: number | null;
  current_assignee_name: string | null;
  created_at: string;
  updated_at: string;
  disposed_at: string | null;
}

export type AssetHistoryEventType =
  | "purchase"
  | "assignment"
  | "return"
  | "repair"
  | "status_change"
  | "condition_change"
  | "retirement"
  | "disposal"
  | "acknowledgement"
  | "usage_state_change";

export interface AssetHistoryEntry {
  id: number;
  performed_by: number | null;
  performed_by_name: string | null;
  event_type: AssetHistoryEventType;
  description: string;
  asset_id: number;
  created_at: string;
}

export interface AssetDocument {
  id: number;
  asset_id: number;
  document_type: "receipt" | "repair_record" | "other";
  file_url: string | null;
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
    value: string | null;
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
// assigned_assets, not the full Asset row (employeeController selects only
// these five columns for that query).
export interface AssignedAssetSummary {
  id: number;
  asset_tag: string;
  name: string | null;
  status: AssetStatus;
  condition: AssetCondition;
}

export interface MyProfile {
  id: number;
  full_name: string | null;
  email: string;
  role: "employee" | "administrator";
  is_active: number;
  created_at: string;
  updated_at: string;
  departments: { id: number; name: string }[];
  assigned_assets: AssignedAssetSummary[];
}

// getEmployeeById returns this exact same shape (id/full_name/.../
// assigned_assets) for an admin viewing someone else's record — same
// controller logic as getMyProfile, just keyed off :id instead of the JWT.
export type EmployeeProfile = MyProfile;

// getAllEmployees's list shape — narrower than EmployeeProfile (no
// assigned_assets, has created_at instead of updated_at).
export interface Employee {
  id: number;
  full_name: string | null;
  email: string;
  role: "employee" | "administrator";
  is_active: number;
  created_at: string;
  departments: { id: number; name: string }[];
}

export type RequestType = "asset" | "return" | "repair";
export type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "sent_for_repair";

// Matches every column of the `requests` table, plus the display names
// joined in from categories/assets/users. `repair_details` is only present
// on admin-facing responses (getAllRequests, and getRequestById when the
// caller is an administrator) — requestController.js's stripPrivateFields()
// removes it everywhere an employee could see their own request.
export interface RequestRecord {
  id: number;
  request_type: RequestType;
  employee_id: number;
  asset_id: number | null;
  asset_name: string | null;
  asset_tag: string | null;
  category_id: number | null;
  category_name: string | null;
  reason: string | null;
  repair_details?: string | null;
  completion_notes: string | null;
  review_notes: string | null;
  status: RequestStatus | null;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  resulting_asset_id: number | null;
  created_at: string;
  reviewed_at: string | null;
  completed_at: string | null;
  completed_by: number | null;
  acknowledged_at: string | null;
  // Only present on admin-facing endpoints (getAllRequests, getRequestById
  // for an administrator) — the joins that produce these aren't run for
  // getMyRequests/getMyRequests-shaped responses, hence optional.
  employee_name?: string;
  employee_email?: string;
  asset_status?: AssetStatus;
  completed_by_name?: string;
  resulting_asset_name?: string | null;
  resulting_asset_tag?: string | null;
}

export interface RequestNote {
  id: number;
  note: string;
  status_at_time: RequestStatus;
  created_at: string;
  admin_name: string | null;
}

export interface Acknowledgement {
  asset_id: number;
  name: string | null;
  category_name: string | null;
  condition: AssetCondition;
  is_active: number;
  assigned_at: string;
  assigned_by_name: string | null;
  acknowledged_at: string | null;
  returned_at: string | null;
}
