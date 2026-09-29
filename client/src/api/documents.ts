// asset document uploads/downloads (receipts, repair papers etc)
import api from "./axios";
import type { AssetDocument, ListResponse } from "../types";

export async function getDocumentsForAsset(assetId: number) {
  const response = await api.get<ListResponse<AssetDocument>>(
    `/assets/${assetId}/documents`,
  );
  return response.data.data;
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

// Two steps: mint a one-time link for this exact document, then fetch it
// immediately. The link only works once, ever — copying the URL out and
// opening it anywhere else (a different browser, a different admin) fails,
// because whichever request lands first consumes it. It's also still
// behind requireAuth (admin only) on top of that.
//
// The fetch itself goes through axios rather than a plain <a href>/
// window.open on the URL directly, so the JWT actually gets attached (the
// axios interceptor does that; a bare browser navigation wouldn't).
export async function viewDocument(assetId: number, docId: number) {
  const linkResponse = await api.post<{ url: string }>(
    `/assets/${assetId}/documents/${docId}/link`,
  );

  const fileResponse = await api.get<Blob>(linkResponse.data.url, {
    baseURL: api.defaults.baseURL!.replace(/\/api$/, ""),
    responseType: "blob",
  });
  const blobUrl = URL.createObjectURL(fileResponse.data);
  window.open(blobUrl, "_blank");
}
