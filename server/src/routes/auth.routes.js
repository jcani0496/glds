// server/src/routes/auth.routes.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { admins } from '../models.js';
import { signToken } from '../auth.js';

const r = Router();

r.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const admin = admins.findByEmail(email);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ id: admin.id, email: admin.email });
  res.json({ token, email: admin.email });
});

// util: validar token rápidamente
r.get('/me', (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    res.json({ ok: true, payload });
  } catch {
    res.status(400).json({ ok: false });
  }
});

export default r;