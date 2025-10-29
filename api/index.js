// api/index.js - Vercel Serverless Function Handler
import '../server/src/index.js';

export default async function handler(req, res) {
  // Este archivo actúa como un proxy para el servidor Express
  // Vercel automáticamente ejecutará el servidor Express
  return;
}
