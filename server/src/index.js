 // server/src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";

import { requireAuth } from "./auth.js";

import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";
import quotesRoutes from "./routes/quotes.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import colorsRoutes from './routes/colors.routes.js';
import contactRoutes from './routes/contact.routes.js';
import customersRoutes from './routes/customers.routes.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Estáticos (rutas web)
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(
  "/generated-quotes",
  express.static(path.join(process.cwd(), "generated-quotes"))
);

// Rutas (públicas)
app.use("/auth", authRoutes);
app.use("/contact", contactRoutes);

// Rutas (protegidas)
app.use("/stats", requireAuth, statsRoutes);
app.use("/customers", requireAuth, customersRoutes);

// Otras rutas
app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/uploads", uploadsRoutes);
app.use('/colors', colorsRoutes);
app.use("/quotes", quotesRoutes);

// Start
const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});