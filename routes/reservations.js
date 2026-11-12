const express = require("express");
const router = express.Router();
const { run, get, all } = require("../database");

const VALID_STATUSES = ["Booked", "Cancelled", "Completed"];

function validDate(value) {
  return typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function validTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function validateReservation(body) {
  const errors = [];
  if (!Number.isInteger(Number(body.player_id)) || Number(body.player_id) < 1) {
    errors.push("A valid player_id is required.");
  }
  if (!Number.isInteger(Number(body.court_id)) || Number(body.court_id) < 1) {
    errors.push("A valid court_id is required.");
  }
  if (!validDate(body.booking_date)) errors.push("booking_date must use YYYY-MM-DD format.");
  if (!validTime(body.booking_time)) errors.push("booking_time must use HH:MM format.");
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}.`);
  }
  return errors;
}

// Keep this route before /:id so "details" is not treated as an ID.
router.get("/details", async (req, res) => {
  try {
    const rows = await all(`
      SELECT
        reservations.id,
        reservations.booking_date,
        reservations.booking_time,
        reservations.status,
        players.name AS player_name,
        courts.name AS court_name,
        courts.sport AS sport
      FROM reservations
      INNER JOIN players ON reservations.player_id = players.id
      INNER JOIN courts ON reservations.court_id = courts.id
      ORDER BY reservations.id
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve reservation details." });
  }
});

router.get("/", async (req, res) => {
  try {
    const rows = await all("SELECT * FROM reservations ORDER BY id");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve reservations." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const reservation = await get("SELECT * FROM reservations WHERE id = ?", [req.params.id]);
    if (!reservation) return res.status(404).json({ error: "Reservation not found." });
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve reservation." });
  }
});

router.post("/", async (req, res) => {
  const body = req.body || {};
  const errors = validateReservation(body);
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  try {
    const player = await get("SELECT id FROM players WHERE id = ?", [body.player_id]);
    const court = await get("SELECT id FROM courts WHERE id = ?", [body.court_id]);
    if (!player) return res.status(404).json({ error: "Player not found." });
    if (!court) return res.status(404).json({ error: "Court not found." });

    const result = await run(
      `INSERT INTO reservations
       (player_id, court_id, booking_date, booking_time, status)
       VALUES (?, ?, ?, ?, ?)`,
      [body.player_id, body.court_id, body.booking_date, body.booking_time, body.status || "Booked"]
    );
    const created = await get("SELECT * FROM reservations WHERE id = ?", [result.id]);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create reservation." });
  }
});

router.put("/:id", async (req, res) => {
  const body = req.body || {};
  const errors = validateReservation(body);
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  try {
    const existing = await get("SELECT id FROM reservations WHERE id = ?", [req.params.id]);
    if (!existing) return res.status(404).json({ error: "Reservation not found." });

    const player = await get("SELECT id FROM players WHERE id = ?", [body.player_id]);
    const court = await get("SELECT id FROM courts WHERE id = ?", [body.court_id]);
    if (!player) return res.status(404).json({ error: "Player not found." });
    if (!court) return res.status(404).json({ error: "Court not found." });

    await run(
      `UPDATE reservations
       SET player_id = ?, court_id = ?, booking_date = ?, booking_time = ?, status = ?
       WHERE id = ?`,
      [body.player_id, body.court_id, body.booking_date, body.booking_time,
       body.status || "Booked", req.params.id]
    );
    const updated = await get("SELECT * FROM reservations WHERE id = ?", [req.params.id]);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update reservation." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const existing = await get("SELECT id FROM reservations WHERE id = ?", [req.params.id]);
    if (!existing) return res.status(404).json({ error: "Reservation not found." });
    await run("DELETE FROM reservations WHERE id = ?", [req.params.id]);
    res.status(200).json({ message: "Reservation deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete reservation." });
  }
});

module.exports = router;
