// category crud + fetching specs for a category
import api from "./axios";
import type { Category, CategorySpec } from "../types";

// The write shape differs from CategorySpec (the read shape) in one field:
// is_required is a real boolean here (what the create form produces, and
// mysql2 happily writes true/false straight into a tinyint column) — reads
// come back as 0/1 instead, which is CategorySpec.is_required's type.
export interface NewSpec {
  spec_name: string;
  spec_type: CategorySpec["spec_type"];
  is_required: boolean;
}

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
