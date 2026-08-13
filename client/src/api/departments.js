import api from './axios';

export async function getAllDepartments() {
  const response = await api.get('/departments');
  return response.data;
}

export async function createDepartment(name) {
  const response = await api.post('/departments', { name });
  return response.data;
}

export async function updateDepartment(id, { name, is_active }) {
  const response = await api.put(`/departments/${id}`, { name, is_active });
  return response.data;
}

export async function deleteDepartment(id) {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
}
