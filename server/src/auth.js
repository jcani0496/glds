// server/src/auth.js
import jwt from 'jsonwebtoken';

const { JWT_SECRET = 'secret', JWT_EXPIRES = '7d' } = process.env;

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/**
 * Lee token desde:
 *  - Authorization: Bearer <token>
 *  - o cookie `token`
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ')
    ? header.slice(7)
    : (req.cookies?.token || null);

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}