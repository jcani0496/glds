 // server/src/routes/auth.routes.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { admins } from '../models.js';
import { signToken } from '../auth.js';

const r = Router();

r.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await admins.findByEmail(email);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!admin.password_hash) {
      console.error('Admin found but password_hash is missing:', admin);
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ id: admin.id, email: admin.email });
    res.json({ token, email: admin.email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
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