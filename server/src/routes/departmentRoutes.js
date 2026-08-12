import express from 'express';
import {
  createDepartment,
  getAllDepartments,
  updateDepartment,
} from '../controllers/departmentController.js';


import { requireAuth, requireRole } from '../middleware/auth.js';
 
const router = express.Router();
 
// Anyone logged in can VIEW departments
router.get('/', requireAuth, getAllDepartments);
 
// Only admins can CREATE or UPDATE departments
router.post('/', requireAuth, requireRole('administrator'), createDepartment);
router.put('/:id', requireAuth, requireRole('administrator'), updateDepartment);
 
export default router;