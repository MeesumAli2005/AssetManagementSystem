// request workflow calls - create, review, assign, return/repair steps
import api from "./axios";
import type { RequestNote, RequestRecord, RequestStatus } from "../types";

// createRequest's payload shape actually varies by request_type ("asset" vs
// "return"/"repair" needs different fields) — left as a loose record rather
// than a discriminated union for now; worth tightening later if this file
// gets touched again.
type NewRequestPayload = Record<string, unknown>;
type ReviewExtra = Record<string, unknown>;

export async function createRequest(payload: NewRequestPayload) {
  const response = await api.post<RequestRecord>("/requests", payload);
  return response.data;
}

export async function getMyRequests() {
  const response = await api.get<RequestRecord[]>("/requests/mine");
  return response.data;
}

export async function getAllRequests({
  status,
  search,
}: { status?: string | undefined; search?: string | undefined } = {}) {
  const response = await api.get<RequestRecord[]>("/requests", {
    params: { status, search },
  });
  return response.data;
}

export async function getRequestById(id: number) {
  // notes is only present when the caller is an administrator — the
  // controller only attaches it for that role.
  const response = await api.get<RequestRecord & { notes?: RequestNote[] }>(
    `/requests/${id}`,
  );
  return response.data;
}

export async function addRequestNote(id: number, note: string) {
  const response = await api.post<{ message: string }>(
    `/requests/${id}/notes`,
    { note },
  );
  return response.data;
}

export async function reviewRequest(
  id: number,
  status: Extract<RequestStatus, "approved" | "rejected">,
  extra?: ReviewExtra,
) {
  const response = await api.patch<{ message: string }>(
    `/requests/${id}/review`,
    { status, ...extra },
  );
  return response.data;
}

export async function assignAssetToRequest(id: number, asset_id: number) {
  const response = await api.post<{ message: string }>(
    `/requests/${id}/assign`,
    { asset_id },
  );
  return response.data;
}

export async function completeReturn(id: number, notes?: string) {
  const response = await api.patch<{ message: string }>(
    `/requests/${id}/complete-return`,
    { notes },
  );
  return response.data;
}

export async function acknowledgeReturn(id: number) {
  const response = await api.patch<{ message: string }>(
    `/requests/${id}/acknowledge-return`,
  );
  return response.data;
}

export async function completeRepair(id: number, repair_notes?: string) {
  const response = await api.patch<{ message: string }>(
    `/requests/${id}/complete-repair`,
    { repair_notes },
  );
  return response.data;
}
