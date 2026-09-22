// category crud + fetching specs for a category
import api from "./axios";
import type { Category, CategorySpec } from "../types";

type NewSpec = Omit<CategorySpec, "id" | "category_id">;

export async function getAllCategories() {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function getCategoryById(id: number) {
  const response = await api.get<Category>(`/categories/${id}`);
  return response.data;
}

export async function createCategory(name: string, specs: NewSpec[] = []) {
  const response = await api.post<Category>("/categories", { name, specs });
  return response.data;
}

export async function deleteCategory(id: number) {
  const response = await api.delete<{ message: string }>(`/categories/${id}`);
  return response.data;
}
