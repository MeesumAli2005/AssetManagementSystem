import api from './axios';

export async function getAllCategories() {
  const response = await api.get('/categories');
  return response.data;
}

export async function getCategoryById(id) {
  const response = await api.get(`/categories/${id}`);
  return response.data;
}

export async function createCategory(name, specs = []) {
  const response = await api.post('/categories', { name, specs });
  return response.data;
}

export async function deleteCategory(id) 
{
  const response = await api.delete(`/categories/${id}`);
  return response.data;
}