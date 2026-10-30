import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, requireAdmin, AuthenticatedRequest } from '../auth.js';

export const authRouter = Router();

authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE LOWER(email) = LOWER(?)').get(email.trim()) as {
    id: string;
    email: string;
    password_hash: string;
    full_name: string;
    role: string;
  } | undefined;

  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  }

  const isMatch = bcrypt.compareSync(password, admin.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  }

  const token = generateToken({
    id: admin.id,
    email: admin.email,
    full_name: admin.full_name,
    role: admin.role
  });

  return res.json({
    token,
    user: {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role
    }
  });
});

authRouter.get('/me', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const admin = db.prepare('SELECT id, email, full_name, role, created_at FROM admins WHERE id = ?').get(req.admin!.id);
  if (!admin) {
    return res.status(404).json({ error: 'Admin account not found.' });
  }
  return res.json({ user: admin });
});

authRouter.post('/change-password', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  const admin = db.prepare('SELECT password_hash FROM admins WHERE id = ?').get(req.admin!.id) as { password_hash: string } | undefined;
  if (!admin) {
    return res.status(404).json({ error: 'Admin record not found.' });
  }

  const isMatch = bcrypt.compareSync(currentPassword, admin.password_hash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  const now = new Date().toISOString();
  db.prepare('UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?').run(newHash, now, req.admin!.id);

  return res.json({ message: 'Password updated successfully.' });
});
