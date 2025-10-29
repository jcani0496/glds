// api/init-admin.js - Script para crear usuario admin
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Solo permitir en desarrollo o con un token secreto
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.INIT_SECRET || 'init-secret-2024';
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const email = process.env.ADMIN_EMAIL || 'admin@glds.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    // Verificar si ya existe
    const existing = await sql`
      SELECT id FROM admins WHERE email = ${email}
    `;

    if (existing.rows.length > 0) {
      return res.json({
        message: 'Admin user already exists',
        email,
        id: existing.rows[0].id
      });
    }

    // Crear hash del password
    const password_hash = await bcrypt.hash(password, 10);

    // Insertar admin
    const result = await sql`
      INSERT INTO admins (email, password_hash, created_at)
      VALUES (${email}, ${password_hash}, NOW())
      RETURNING id, email, created_at
    `;

    res.json({
      message: 'Admin user created successfully',
      admin: result.rows[0],
      note: 'You can now login with these credentials'
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      error: 'Failed to create admin user',
      message: error.message
    });
  }
}
