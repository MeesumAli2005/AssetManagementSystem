import api from './axios';

export async function getAllAssets({ search, category_id, status, condition, department_id, assignee_id, assigned, page, limit } = {})
{
  const response = await api.get('/assets',
    {
        params: { search, category_id, status, condition, department_id, assignee_id, assigned, page, limit },
    });
  return response.data;
}

export async function getAssetById(id) 
{
  const response = await api.get(`/assets/${id}`);
  return response.data;
}

export async function createAsset(payload) 
{
  const response = await api.post('/assets', payload);
  return response.data;
}

export async function updateAsset(id, payload) 
{
  const response = await api.put(`/assets/${id}`, payload);
  return response.data;
}

export async function retireAsset(id, reason)
{
  const response = await api.post(`/assets/${id}/retire`, { reason });
  return response.data;
}

export async function getMyAssets()
{
  const response = await api.get('/assets/mine');
  return response.data;
}

export async function getPendingAcknowledgements()
{
  const response = await api.get('/assets/pending-acknowledgements');
  return response.data;
}

export async function acknowledgeAssignment(assetId)
{
  const response = await api.post(`/assets/${assetId}/acknowledge`);
  return response.data;
}

export async function setAssetUsageState(assetId, usage_state)
{
  const response = await api.patch(`/assets/${assetId}/usage-state`, { usage_state });
  return response.data;
}