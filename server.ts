import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("inventory.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    expiryDate TEXT NOT NULL,
    addedDate TEXT NOT NULL,
    quantity TEXT NOT NULL
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/inventory", (req, res) => {
    try {
      const items = db.prepare("SELECT * FROM inventory ORDER BY addedDate DESC").all();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory", (req, res) => {
    const { id, name, category, expiryDate, addedDate, quantity } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO inventory (id, name, category, expiryDate, addedDate, quantity)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, name, category, expiryDate, addedDate, quantity);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("DB Error:", error);
      res.status(500).json({ error: "Failed to save item" });
    }
  });

  app.delete("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM inventory WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
