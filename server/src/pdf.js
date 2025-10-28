import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

const MARGIN_L = 40;
const MARGIN_R = 40;
const MARGIN_T = 40;
const MARGIN_B = 40;

const COLS = [
  { key: "product_name", label: "Producto", width: 220 },
  { key: "sku",          label: "SKU",      width: 70  },
  { key: "qty",          label: "Cant.",    width: 45  },
  { key: "color",        label: "Color",    width: 80  },
  { key: "customization",label: "Personalización", width: 100 },
];

export async function buildQuotePDF({ quote, items }) {
  const outDir = path.join(process.cwd(), "generated-quotes");
  ensureDir(outDir);

  const filename = `${quote.code}.pdf`;
  const filePath = path.join(outDir, filename);
  const webPath = `/generated-quotes/${filename}`;

  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - (MARGIN_L + MARGIN_R);

  // Logo
  const logoMain = path.join(process.cwd(), "public", "logo.png");
  const logoAlt  = path.join(process.cwd(), "server", "public", "logo.png");
  const logoPath = fs.existsSync(logoMain) ? logoMain : (fs.existsSync(logoAlt) ? logoAlt : null);
  if (logoPath) doc.image(logoPath, MARGIN_L, MARGIN_T, { width: 120 });

  // Encabezado
  let y = MARGIN_T;
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#111")
     .text("Cotización", MARGIN_L + 160, y);
  y += 28;
  doc.font("Helvetica").fontSize(10).fillColor("#555");
  doc.text(`Código: ${quote.code}`, MARGIN_L + 160, y); y += 14;
  doc.text(`Fecha: ${new Date().toLocaleString()}`, MARGIN_L + 160, y); y += 24;

  // Cliente
  doc.moveTo(MARGIN_L, y).lineTo(MARGIN_L + contentWidth, y).strokeColor("#eee").lineWidth(1).stroke();
  y += 12;
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#111")
     .text("Cliente:", MARGIN_L, y, { underline: true });
  y += 18;
  doc.font("Helvetica").fontSize(11).fillColor("#111");
  if (quote.customer_company) {            // NUEVO
    doc.text(`Empresa: ${quote.customer_company}`, MARGIN_L, y); y += 14;
  }
  doc.text(`${quote.customer_name}`, MARGIN_L, y); y += 14;
  doc.text(`${quote.customer_email}${quote.customer_phone ? " · " + quote.customer_phone : ""}`, MARGIN_L, y); y += 14;
  if (quote.notes) { doc.text(`Notas: ${quote.notes}`, MARGIN_L, y); y += 16; }

  y += 8;
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#111")
     .text("Detalle de productos:", MARGIN_L, y, { underline: true });
  y += 16;

  // Tabla
  const colX = [];
  let x = MARGIN_L;
  COLS.forEach((c) => { colX.push(x); x += c.width; });

  function maybePageBreak(rowHeight = 0) {
    const limit = doc.page.height - MARGIN_B;
    if (y + rowHeight > limit) {
      doc.addPage();
      y = MARGIN_T;
      drawHeader();
    }
  }

  function drawHeader() {
    doc.moveTo(MARGIN_L, y).lineTo(MARGIN_L + contentWidth, y).strokeColor("#eee").lineWidth(1).stroke();
    y += 8;
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#111");
    COLS.forEach((c, i) => doc.text(c.label, colX[i], y, { width: c.width, align: "left" }));
    y += 16;
    doc.moveTo(MARGIN_L, y).lineTo(MARGIN_L + contentWidth, y).strokeColor("#ddd").lineWidth(1).stroke();
    y += 6;
    doc.font("Helvetica").fontSize(10).fillColor("#111");
  }

  function drawRow(row) {
    const texts = [
      String(row.product_name || "-"),
      String(row.sku || "-"),
      String(row.qty || 1),
      String(row.color || "-"),
      String(row.customization || "-"),
    ];
    const heights = texts.map((t, i) =>
      doc.heightOfString(t, { width: COLS[i].width, align: "left" })
    );
    const rowH = Math.max(...heights) + 4;

    maybePageBreak(rowH);
    texts.forEach((t, i) => doc.text(t, colX[i], y, { width: COLS[i].width, align: "left" }));
    y += rowH;
    doc.moveTo(MARGIN_L, y).lineTo(MARGIN_L + contentWidth, y).strokeColor("#f0f0f0").lineWidth(1).stroke();
    y += 4;
  }

  drawHeader();
  items.forEach(drawRow);

  // Nota
  maybePageBreak(50);
  y += 8;
  doc.font("Helvetica").fontSize(9).fillColor("#555").text(
    "Esta cotización es informativa y no incluye precios en esta versión del catálogo. " +
    "Nos pondremos en contacto para confirmar precios, tiempos y personalizaciones.",
    MARGIN_L, y, { width: contentWidth }
  );

  doc.end();
  await new Promise((r) => stream.on("finish", r));
  return { filePath, webPath };
}