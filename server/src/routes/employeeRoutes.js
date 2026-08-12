
import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  setEmployeeActiveStatus,
  getMyProfile,
  updateMyProfile,
} from '../controllers/employeeController.js';


import { createEmployeeAccount } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
 
const router = express.Router();

/// self service routes for logged in employees
router.get('/me', requireAuth, getMyProfile);
router.put('/me', requireAuth, updateMyProfile);
 
// Employees viewing/managing "their own" stuff (like their own profile)
// will be handled through separate routes, all these are admin only
 
router.get('/', requireAuth, requireRole('administrator'), getAllEmployees);
router.get('/:id', requireAuth, requireRole('administrator'), getEmployeeById);
router.post('/', requireAuth, requireRole('administrator'), createEmployeeAccount);
router.put('/:id', requireAuth, requireRole('administrator'), updateEmployee);
router.patch('/:id/status', requireAuth, requireRole('administrator'), setEmployeeActiveStatus);
 
export default router;