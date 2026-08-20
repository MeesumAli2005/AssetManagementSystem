import api from './axios';

export async function createRequest(payload)
{
  const response = await api.post('/requests', payload);
  return response.data;
}

export async function getMyRequests()
{
  const response = await api.get('/requests/mine');
  return response.data;
}

export async function getAllRequests(status)
{
  const response = await api.get('/requests', { params: { status } });
  return response.data;
}

export async function getRequestById(id)
{
  const response = await api.get(`/requests/${id}`);
  return response.data;
}

export async function reviewRequest(id, status, extra)
{
  const response = await api.patch(`/requests/${id}/review`, { status, ...extra });
  return response.data;
}

export async function assignAssetToRequest(id, asset_id)
{
  const response = await api.post(`/requests/${id}/assign`, { asset_id });
  return response.data;
}

export async function completeReturn(id, notes)
{
  const response = await api.patch(`/requests/${id}/complete-return`, { notes });
  return response.data;
}

export async function acknowledgeReturn(id)
{
  const response = await api.patch(`/requests/${id}/acknowledge-return`);
  return response.data;
}

export async function completeRepair(id, repair_notes)
{
  const response = await api.patch(`/requests/${id}/complete-repair`, { repair_notes });
  return response.data;
}
