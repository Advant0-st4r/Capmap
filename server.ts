import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";

const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;

// Database Setup
const db = new Database("capmap.db");
db.pragma("journal_mode = WAL");

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS it_assets (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    environment TEXT
  );

  CREATE TABLE IF NOT EXISTS capabilities (
    id TEXT PRIMARY KEY,
    name TEXT,
    domain TEXT,
    maturity_level INTEGER
  );

  CREATE TABLE IF NOT EXISTS processes (
    id TEXT PRIMARY KEY,
    name TEXT,
    owner TEXT,
    domain TEXT,
    capability_id TEXT,
    FOREIGN KEY(capability_id) REFERENCES capabilities(id)
  );

  CREATE TABLE IF NOT EXISTS relationships (
    id TEXT PRIMARY KEY,
    source_id TEXT,
    source_type TEXT,
    target_id TEXT,
    target_type TEXT,
    relationship_type TEXT
  );

  CREATE TABLE IF NOT EXISTS metrics (
    id TEXT PRIMARY KEY,
    capability_id TEXT,
    kpi_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(capability_id) REFERENCES capabilities(id)
  );

  CREATE TABLE IF NOT EXISTS visualizations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    prompt TEXT,
    image_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS interaction_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    event_type TEXT,
    entity_type TEXT,
    entity_id TEXT,
    metadata_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS generation_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    date TEXT,
    count INTEGER,
    UNIQUE(user_id, date)
  );

  -- Seed Data
  INSERT OR IGNORE INTO capabilities (id, name, domain, maturity_level) VALUES 
  ('cap1', 'Strategic Planning', 'Strategy', 4),
  ('cap2', 'Supply Chain Management', 'Operations', 3),
  ('cap3', 'Customer Relationship Management', 'Sales', 5),
  ('cap4', 'Financial Reporting', 'Finance', 4),
  ('cap5', 'Talent Acquisition', 'HR', 2);
`);

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API Routes ---

  // Auth Mock (Simplified for MVP)
  app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      const id = Math.random().toString(36).substring(7);
      db.prepare("INSERT INTO users (id, email, role) VALUES (?, ?, ?)").run(id, email, "user");
      user = { id, email, role: "user" };
    }
    res.json(user);
  });

  // Capabilities
  app.get("/api/capabilities", (req, res) => {
    const caps = db.prepare("SELECT * FROM capabilities").all();
    res.json(caps);
  });

  app.post("/api/capabilities", (req, res) => {
    const { name, domain, maturity_level } = req.body;
    const id = Math.random().toString(36).substring(7);
    db.prepare("INSERT INTO capabilities (id, name, domain, maturity_level) VALUES (?, ?, ?, ?)").run(id, name, domain, maturity_level);
    res.json({ id, name, domain, maturity_level });
  });

  // Metrics Generation
  app.post("/api/metrics/generate", async (req, res) => {
    const { capabilityId, userId } = req.body;
    
    // Quota Check
    const today = new Date().toISOString().split("T")[0];
    let usage = db.prepare("SELECT count FROM generation_usage WHERE user_id = ? AND date = ?").get(userId, today);
    if (usage && usage.count >= 50) {
      return res.status(429).json({ error: "Daily AI generation limit reached. Please try again after 24 hours." });
    }

    // Cache Check
    const cached = db.prepare("SELECT * FROM metrics WHERE capability_id = ? ORDER BY timestamp DESC LIMIT 1").get(capabilityId);
    if (cached) {
      return res.json(JSON.parse(cached.kpi_json));
    }

    // Gemini Call (Mocking the logic for now, will be implemented in frontend as per guidelines)
    // Actually, baseline says "Always call Gemini API from the frontend code".
    // So I should provide the data for the frontend to call Gemini.
    const capability = db.prepare("SELECT * FROM capabilities WHERE id = ?").get(capabilityId);
    res.json({ capability, status: "ready_for_generation" });
  });

  // Interaction Logging
  app.post("/api/user/interactions", (req, res) => {
    const { userId, eventType, entityType, entityId, metadata } = req.body;
    db.prepare("INSERT INTO interaction_events (user_id, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, ?)")
      .run(userId, eventType, entityType, entityId, JSON.stringify(metadata));
    res.json({ status: "ok" });
  });

  // Export
  app.post("/api/export", async (req, res) => {
    const { type, data } = req.body;
    if (type === "csv") {
      const parser = new Parser();
      const csv = parser.parse(data);
      res.header("Content-Type", "text/csv");
      res.attachment("export.csv");
      return res.send(csv);
    } else if (type === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Metrics");
      sheet.columns = Object.keys(data[0] || {}).map(k => ({ header: k, key: k }));
      data.forEach(row => sheet.addRow(row));
      res.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.attachment("export.xlsx");
      await workbook.xlsx.write(res);
      return res.end();
    }
    res.status(400).send("Unsupported format");
  });

  // --- Vite Integration ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
