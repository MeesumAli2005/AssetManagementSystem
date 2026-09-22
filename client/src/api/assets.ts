// all the asset endpoints are live here listing, crud, retire/dispose, acks, stats
import api from "./axios";
import type {
  Acknowledgement,
  Asset,
  AssetDetail,
  AssetStats,
  PaginatedAssets,
} from "../types";

interface AssetListFilters {
  search?: string;
  category_id?: number;
  status?: string;
  condition?: string;
  department_id?: number;
  assignee_id?: number;
  assigned?: boolean;
  page?: number;
  limit?: number;
}

export async function getAllAssets({
  search,
  category_id,
  status,
  condition,
  department_id,
  assignee_id,
  assigned,
  page,
  limit,
}: AssetListFilters = {}) {
  const response = await api.get<PaginatedAssets>("/assets", {
    params: {
      search,
      category_id,
      status,
      condition,
      department_id,
      assignee_id,
      assigned,
      page,
      limit,
    },
  });
  return response.data;
}

export async function getAssetById(id: number) {
  const response = await api.get<AssetDetail>(`/assets/${id}`);
  return response.data;
}

export async function createAsset(payload: Record<string, unknown>) {
  const response = await api.post<Asset>("/assets", payload);
  return response.data;
}

export async function updateAsset(id: number, payload: Record<string, unknown>) {
  const response = await api.put<{ message: string }>(`/assets/${id}`, payload);
  return response.data;
}

export async function retireAsset(id: number, reason: string) {
  const response = await api.post<{ message: string }>(`/assets/${id}/retire`, {
    reason,
  });
  return response.data;
}

export async function disposeAsset(id: number, reason: string) {
  const response = await api.post<{ message: string }>(`/assets/${id}/dispose`, {
    reason,
  });
  return response.data;
}

export async function getMyAssets() {
  const response = await api.get<Asset[]>("/assets/mine");
  return response.data;
}

export async function getPendingAcknowledgements() {
  const response = await api.get<Acknowledgement[]>(
    "/assets/pending-acknowledgements",
  );
  return response.data;
}

export async function getMyAcknowledgements() {
  const response = await api.get<Acknowledgement[]>(
    "/assets/my-acknowledgements",
  );
  return response.data;
}

export async function getAcknowledgementById(id: number) {
  const response = await api.get<Acknowledgement>(
    `/assets/acknowledgements/${id}`,
  );
  return response.data;
}

export async function acknowledgeAssignment(assetId: number) {
  const response = await api.post<{ message: string }>(
    `/assets/${assetId}/acknowledge`,
  );
  return response.data;
}

export async function setAssetUsageState(assetId: number, usage_state: string) {
  const response = await api.patch<{ message: string }>(
    `/assets/${assetId}/usage-state`,
    { usage_state },
  );
  return response.data;
}

export async function getAssetStats() {
  const response = await api.get<AssetStats>("/assets/stats");
  return response.data;
}
