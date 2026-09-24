// admin-only account stuff - creating employee/admin accounts and resetting passwords
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../config/db.js";
import { BCRYPT_SALT_ROUNDS, ROLES } from "../constants.js";

export async function createEmployeeAccount(req: Request, res: Response) {
  try {
    const { full_name, email, temporary_password, role } = req.body;

    if (!email || !temporary_password) {
      return res
        .status(400)
        .json({ message: "Email and temporary password are required" });
    }

    const allowedRoles: string[] = Object.values(ROLES);
    const finalRole = allowedRoles.includes(role) ? role : ROLES.EMPLOYEE;

    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(temporary_password, BCRYPT_SALT_ROUNDS);

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [full_name, email, password_hash, finalRole],
    );

    return res.status(201).json({
      id: result.insertId,
      email,
      role: finalRole,
      message:
        "Account created. Share the temporary password with the employee securely.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error creating account" });
  }
}

export async function resetEmployeePassword(req: Request, res: Response) {
  try {
    const { user_id, temporary_password } = req.body;

    if (!user_id || !temporary_password) {
      return res
        .status(400)
        .json({ message: "user_id and temporary_password are required" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ?",
      [user_id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const password_hash = await bcrypt.hash(temporary_password, BCRYPT_SALT_ROUNDS);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      password_hash,
      user_id,
    ]);

    return res.json({
      message:
        "Password reset. Share the new temporary password with the employee securely.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error resetting password" });
  }
}
