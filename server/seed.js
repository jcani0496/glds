// server/seed.js
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './src/db.js';

const email = process.env.ADMIN_EMAIL || 'admin@glds.com';
const envHash = process.env.ADMIN_PASSWORD_HASH || '';
const plain = process.env.ADMIN_PASSWORD || 'Admin123!';

const passHash = envHash || bcrypt.hashSync(plain, 10);

const row = db.prepare('SELECT id, email FROM admins WHERE email = ?').get(email);
if (row) {
  // Actualiza el hash por si cambió
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(passHash, row.id);
  console.log(`✔ Admin actualizado: ${email}`);
} else {
  db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(email, passHash);
  console.log(`✔ Admin creado: ${email}`);
}

console.log('Listo. Puedes iniciar sesión con:');
console.log(`  Email: ${email}`);
console.log(`  Password: ${envHash ? '(la de tu ADMIN_PASSWORD_HASH)' : plain}`);
process.exit(0);