// Zod schemas for the write endpoints (POST/PUT/PATCH/DELETE bodies). Each
// one checks presence and type only — the field-depends-on-another-field
// business rules (e.g. createRequest's category_id being required only for
// an "asset"-type request) stay in the controllers, since they already
// handle that well and it's not the kind of thing a shape check should
// duplicate.
import { z } from "zod";
import {
  ASSET_CONDITIONS,
  MIN_PASSWORD_LENGTH,
  REQUEST_TYPES,
  ROLES,
  USAGE_STATES,
} from "./constants.js";

// An id-shaped field arriving in a JSON body (as opposed to a URL param,
// which validateIdParam handles) — accepts a number or a numeric string,
// since we can't be sure which one the client serialized.
const idField = z.coerce.number().int().positive();

// --- auth ---
export const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(MIN_PASSWORD_LENGTH),
  confirm_password: z.string().min(1),
});

// --- admin ---
export const createEmployeeAccountSchema = z.object({
  full_name: z.string().min(1).optional(),
  email: z.string().min(1),
  temporary_password: z.string().min(MIN_PASSWORD_LENGTH),
  role: z.enum([ROLES.EMPLOYEE, ROLES.ADMINISTRATOR]).optional(),
});

export const resetEmployeePasswordSchema = z.object({
  user_id: idField,
  temporary_password: z.string().min(MIN_PASSWORD_LENGTH),
});

// --- categories ---
const specInputSchema = z.object({
  spec_name: z.string().min(1),
  spec_type: z.enum(["text", "number", "boolean", "dropdown"]).optional(),
  is_required: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1),
  specs: z.array(specInputSchema).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1),
});

export const addSpecToCategorySchema = specInputSchema;

// --- departments ---
export const createDepartmentSchema = z.object({
  name: z.string().min(1),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1),
  is_active: z.boolean(),
});

// --- employees ---
export const updateMyProfileSchema = z.object({
  full_name: z.string().min(1),
});

export const updateEmployeeSchema = z.object({
  full_name: z.string().min(1).optional(),
  department_ids: z.array(idField).optional(),
});

export const setEmployeeActiveStatusSchema = z.object({
  is_active: z.boolean(),
});

// --- assets ---
const specValueInputSchema = z.object({
  category_spec_id: idField,
  value: z.unknown(),
});

export const createAssetSchema = z.object({
  brand: z.string().min(1),
  category_id: idField,
  purchase_date: z.string().nullable().optional(),
  purchase_cost: z.coerce.number().nullable().optional(),
  condition: z.enum(ASSET_CONDITIONS).optional(),
  spec_values: z.array(specValueInputSchema).optional(),
});

// Mirrors assetController's own VALID_STATUSES — deliberately excludes
// "disposed", which (like "assigned") isn't a status you can set directly
// through this endpoint.
const settableAssetStatus = ["available", "assigned", "under_repair", "retired"] as const;

export const updateAssetSchema = z.object({
  name: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  category_id: idField.optional(),
  purchase_date: z.string().nullable().optional(),
  purchase_cost: z.coerce.number().nullable().optional(),
  status: z.enum(settableAssetStatus).optional(),
  condition: z.enum(ASSET_CONDITIONS).optional(),
  spec_values: z.array(specValueInputSchema).optional(),
  assignee_id: idField.nullable().optional(),
});

export const retireOrDisposeAssetSchema = z.object({
  reason: z.string().min(1).optional(),
});

export const setUsageStateSchema = z.object({
  usage_state: z.enum(USAGE_STATES),
});

// --- requests ---
export const createRequestSchema = z.object({
  request_type: z.enum(REQUEST_TYPES),
  category_id: idField.optional(),
  asset_id: idField.optional(),
  reason: z.string().min(1),
});

export const addRequestNoteSchema = z.object({
  note: z.string().min(1),
});

export const reviewRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  repair_details: z.string().nullable().optional(),
  review_notes: z.string().nullable().optional(),
});

export const assignAssetToRequestSchema = z.object({
  asset_id: idField,
});

export const completeReturnSchema = z.object({
  notes: z.string().nullable().optional(),
});

export const completeRepairSchema = z.object({
  repair_notes: z.string().nullable().optional(),
});
