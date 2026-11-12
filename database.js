const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dataDirectory = path.join(__dirname, "data");
fs.mkdirSync(dataDirectory, { recursive: true });

const dbPath = path.join(dataDirectory, "sunnycourts.db");
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

async function initializeDatabase() {
  await run("PRAGMA foreign_keys = ON");

  await run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS courts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sport TEXT NOT NULL CHECK (sport IN ('Tennis', 'Badminton', 'Squash')),
      is_available INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0, 1))
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      court_id INTEGER NOT NULL,
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Booked'
        CHECK (status IN ('Booked', 'Cancelled', 'Completed')),
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE RESTRICT,
      FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE RESTRICT
    )
  `);

  // Add small sample records only when the tables are empty.
  const playerCount = await get("SELECT COUNT(*) AS count FROM players");
  if (playerCount.count === 0) {
    await run(
      "INSERT INTO players (name, email, phone) VALUES (?, ?, ?)",
      ["Aarav Kumar", "aarav@example.com", "9876543210"]
    );
    await run(
      "INSERT INTO players (name, email, phone) VALUES (?, ?, ?)",
      ["Diya Reddy", "diya@example.com", "9876501234"]
    );
  }

  const courtCount = await get("SELECT COUNT(*) AS count FROM courts");
  if (courtCount.count === 0) {
    await run("INSERT INTO courts (name, sport) VALUES (?, ?)", ["Court A", "Tennis"]);
    await run("INSERT INTO courts (name, sport) VALUES (?, ?)", ["Court B", "Badminton"]);
    await run("INSERT INTO courts (name, sport) VALUES (?, ?)", ["Court C", "Squash"]);
  }

  const reservationCount = await get("SELECT COUNT(*) AS count FROM reservations");
  if (reservationCount.count === 0) {
    const player = await get("SELECT id FROM players ORDER BY id LIMIT 1");
    const court = await get("SELECT id FROM courts ORDER BY id LIMIT 1");
    await run(
      `INSERT INTO reservations
       (player_id, court_id, booking_date, booking_time, status)
       VALUES (?, ?, ?, ?, ?)`,
      [player.id, court.id, "2026-11-20", "18:00", "Booked"]
    );
  }

  console.log(`SQLite database ready: ${dbPath}`);
}

module.exports = { db, run, get, all, initializeDatabase };
