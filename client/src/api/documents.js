import api from './axios';

export async function getDocumentsForAsset(assetId)
{
    const response = await api.get(`/assets/${assetId}/documents`);
    return response.data;
}

export async function uploadDocument(assetId, file, documentType)
{
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);

  const response = await api.post(`/assets/${assetId}/documents`, formData);
  return response.data;
}

// server.js serves /uploads behind requireAuth, so a plain <a href> tab
// open won't carry the JWT — fetch it through axios (which does attach the
// header via the interceptor) as a blob, then open that instead.
export async function downloadDocument(fileUrl) {
  const response = await api.get(fileUrl, {
    baseURL: 'http://172.20.2.224:5000',
    responseType: 'blob',
  });
  const blobUrl = URL.createObjectURL(response.data);
  window.open(blobUrl, '_blank');
}