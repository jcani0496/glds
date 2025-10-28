// server/src/routes/uploads.routes.js
import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth } from "../auth.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
});

const r = Router();

/** Subir imagen a Cloudinary (solo admin) */
r.post("/image", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no_file" });

    const folder = process.env.CLOUDINARY_FOLDER || "glds/products";

    const streamResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          overwrite: true,
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    // Devolvemos URL segura + public_id para administrar luego si quieres borrar
    res.json({
      url: streamResult.secure_url,
      public_id: streamResult.public_id, // p.ej. glds/products/abc123
      width: streamResult.width,
      height: streamResult.height,
      format: streamResult.format,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "upload_failed" });
  }
});

/** (Opcional) Borrar imagen por URL o public_id (solo admin) */
function publicIdFromUrl(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.split("/upload/")[1]; // ej: v1712345/glds/products/abc.png
    const noVersion = path.replace(/^v\d+\//, ""); // glds/products/abc.png
    return noVersion.replace(/\.[^/.]+$/, ""); // glds/products/abc
  } catch {
    return null;
  }
}

r.post("/image/delete", requireAuth, async (req, res) => {
  try {
    const { url, public_id } = req.body || {};
    const pid = public_id || publicIdFromUrl(url);
    if (!pid) return res.status(400).json({ error: "invalid_public_id" });
    await cloudinary.uploader.destroy(pid);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "delete_failed" });
  }
});

export default r;