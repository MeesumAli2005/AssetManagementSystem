// asset document uploads/downloads (receipts, repair papers etc)
import api from "./axios";
import type { AssetDocument } from "../types";

export async function getDocumentsForAsset(assetId: number) {
  const response = await api.get<AssetDocument[]>(
    `/assets/${assetId}/documents`,
  );
  return response.data;
}

export async function uploadDocument(
  assetId: number,
  file: File,
  documentType: string,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", documentType);

  const response = await api.post<AssetDocument>(
    `/assets/${assetId}/documents`,
    formData,
  );
  return response.data;
}

// server.js serves /api/uploads behind requireAuth, so a plain <a href> tab
// open won't carry the JWT — fetch it through axios (which does attach the
// header via the interceptor) as a blob, then open that instead.
export async function downloadDocument(fileUrl: string) {
  const response = await api.get<Blob>(fileUrl, {
    baseURL: api.defaults.baseURL!.replace(/\/api$/, ""),
    responseType: "blob",
  });
  const blobUrl = URL.createObjectURL(response.data);
  window.open(blobUrl, "_blank");
}
