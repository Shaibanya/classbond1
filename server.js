const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

const cors = require("cors");
app.use(cors());

const SUBJECTS = [
  "English",
  "Science",
  "Maths",
  "SST",
  "History",
  "Geography",
  "Computer Science",
  "Bengali",
  "Physics",
  "Chemistry",
  "Biology",
  "Hindi",
];

const db = new Database(path.join(__dirname, "tutoring.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

const columns = db.prepare("PRAGMA table_info(inquiries)").all();
if (!columns.some((col) => col.name === "class_name")) {
  db.exec("ALTER TABLE inquiries ADD COLUMN class_name TEXT");
}
if (!columns.some((col) => col.name === "city")) {
  db.exec("ALTER TABLE inquiries ADD COLUMN city TEXT");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "ClassBond/frontend/public")));

app.get("/api/subjects", (req, res) => {
  const query = String(req.query.q || "")
    .trim()
    .toLowerCase();
  const results = query
    ? SUBJECTS.filter((s) => s.toLowerCase().includes(query))
    : SUBJECTS;
  res.json(results);
});

app.post("/api/inquiries", (req, res) => {
  const { subject, phone, class_name, city } = req.body;

  if (!subject || !phone || !class_name || !city) {
    return res.status(400).json({
      error: "Class, city, subject, and phone number are required.",
    });
  }

  const cleanedSubject = String(subject).trim();
  if (cleanedSubject.length < 2) {
    return res
      .status(400)
      .json({ error: "Please enter a valid subject name." });
  }

  const cleanedClass = String(class_name).trim();
  if (!cleanedClass) {
    return res.status(400).json({ error: "Please select your class." });
  }

  const cleanedCity = String(city).trim();
  if (!cleanedCity) {
    return res.status(400).json({ error: "Please enter your city." });
  }

  const cleanedPhone = String(phone).replace(/\D/g, "");
  if (cleanedPhone.length < 10) {
    return res
      .status(400)
      .json({ error: "Please enter a valid 10-digit phone number." });
  }

  const insert = db.prepare(
    "INSERT INTO inquiries (subject, class_name, city, phone) VALUES (?, ?, ?, ?)",
  );
  const result = insert.run(
    cleanedSubject,
    cleanedClass,
    cleanedCity,
    cleanedPhone,
  );

  res.status(201).json({
    success: true,
    message: "Thank you! We will connect with you soon.",
    id: result.lastInsertRowid,
  });
});

app.get("/api/inquiries", (_req, res) => {
  const rows = db
    .prepare(
      "SELECT id, subject, class_name, city, phone, created_at FROM inquiries ORDER BY created_at DESC",
    )
    .all();
  res.json(rows);
});

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.listen(PORT, () => {
  console.log(`Tutoring website running at http://localhost:${PORT}`);
});
