// src/controllers/adminController.js
//
// Every function in this file assumes it's sitting behind
// requireAuth + requireRole('administrator') in the route definition.
// That means by the time code here runs, we already know: (1) there's a
// valid logged-in user, and (2) req.user.role === 'administrator'.
// We don't re-check that here  cuz middleware guranteed it.

import bcrypt from 'bcrypt';
import pool from '../config/db.js';

// ---------------------------------------------------------------------
// ADMIN CREATES AN EMPLOYEE (OR ADMIN) ACCOUNT
//
// Unlike signup(), this endpoint IS allowed to set role directly, because
// only an already-verified admin can reach this code at all (enforced by
// the route's middleware, not by this function).
// ---------------------------------------------------------------------
export async function createEmployeeAccount(req, res) 
{
  try 
  {
    const { full_name, email, temporary_password, role } = req.body;

    if (!email || !temporary_password) {
      return res.status(400).json({ message: 'Email and temporary password are required' });
    }

    const allowedRoles = ['employee', 'administrator'];
    const finalRole = allowedRoles.includes(role) ? role : 'employee';

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(temporary_password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [full_name, email, password_hash, finalRole]
    );

    return res.status(201).json({
      id: result.insertId,
      email,
      role: finalRole,
      message: 'Account created. Share the temporary password with the employee securely.',
    });
  }
   catch (err) 
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error creating account' });
    } 
}

// ---------------------------------------------------------------------
// ADMIN RESETS ANY USER'S PASSWORD
//
// This is what covers "forgot password" in practice: the employee can't
// self-recover 
// ---------------------------------------------------------------------
export async function resetEmployeePassword(req, res) 
{
  try 
  {
    const { user_id, temporary_password } = req.body;

    if (!user_id || !temporary_password) 
    {
      return res.status(400).json({ message: 'user_id and temporary_password are required' });
    }

    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const password_hash = await bcrypt.hash(temporary_password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, user_id]);

    return res.json({ message: 'Password reset. Share the new temporary password with the employee securely.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error resetting password' });
  }
}