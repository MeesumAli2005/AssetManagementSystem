import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
 
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '30m';

// export async function signup(req, res) {
//   try {
//     const { full_name, email, password } = req.body;
 
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }
 
//     const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
//     if (existing.length > 0) {
//       return res.status(409).json({ message: 'Email already registered' });
//     }
 
//     const password_hash = await bcrypt.hash(password, 10);
 
//     const [result] = await pool.query(
//       'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
//       [full_name, email, password_hash, 'employee'] // always employee — never trust client-sent role
//     );
 
//     return res.status(201).json({ id: result.insertId, email, role: 'employee' });
//   } 
  
//   catch (err) 
//   {
//     console.error(err);
//     return res.status(500).json({ message: 'Server error during signup' });
//   }
// }

// ---------------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------------
export async function login(req, res) 
{
  try 
  {
    const { email, password } = req.body;
 
    if (!email || !password) 
    {
      return res.status(400).json({ message: 'Email and password are required' });
    }
 
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
 
    if (!user) 
    {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
 
    if (!user.is_active) 
    {
      return res.status(403).json({ message: 'Account is deactivated' });
    }
 
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) 
    {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
 
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
 
    return res.json({
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
    });
  } 
  
  catch (err) 
  {
    console.error(err);
    return res.status(500).json({ message: 'Server error during login' });
  }
}
 
//
// This endpoint exists mainly so the frontend has something to call for
// consistency/logging.
// ---------------------------------------------------------------------
export async function logout(req, res) {
  return res.json({ message: 'Logged out. Please discard your token client-side.' });
}
 
// ---------------------------------------------------------------------
// CHANGE PASSWORD
export async function changePassword(req, res) 
{
  try {
    const { current_password, new_password, confirm_password } = req.body;
 
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
 
    if (new_password !== confirm_password) {
      return res.status(400).json({ message: 'New password and confirmation do not match' });
    }

 
    // req.user comes from the JWT payload set by requireAuth middleware
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];
 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
 
    const currentMatches = await bcrypt.compare(current_password, user.password_hash);
    if (!currentMatches) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
 
    const password_hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      password_hash,
      req.user.id,
    ]);
 
    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error changing password' });
  }
}