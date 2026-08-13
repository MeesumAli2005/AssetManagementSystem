import express from 'express';
import {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';


import { requireAuth, requireRole } from '../middleware/auth.js';
 
const router = express.Router();
 
// Anyone logged in can VIEW departments
router.get('/', requireAuth, getAllDepartments);
 
// Only admins can CREATE, UPDATE, or DELETE departments
router.post('/', requireAuth, requireRole('administrator'), createDepartment);
router.put('/:id', requireAuth, requireRole('administrator'), updateDepartment);
router.delete('/:id', requireAuth, requireRole('administrator'), deleteDepartment);
 
export default router;