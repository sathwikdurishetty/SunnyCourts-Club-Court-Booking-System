const express = require("express");
const router = express.Router();
const { run, get, all } = require("../database");

const ALLOWED_SPORTS = ["Tennis", "Badminton", "Squash"];

function validateCourt(name, sport) {
  const errors = [];
  if (typeof name !== "string" || !name.trim()) {
    errors.push("Court name is required and must be a non-empty string.");
  }
  if (typeof sport !== "string" || !ALLOWED_SPORTS.includes(sport)) {
    errors.push(`Sport must be one of: ${ALLOWED_SPORTS.join(", ")}.`);
  }
  return errors;
}

// GET /courts?sport=Tennis
router.get("/", async (req, res) => {
  try {
    const { sport } = req.query;
    if (sport !== undefined && !ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({
        error: `Invalid sport. Allowed values: ${ALLOWED_SPORTS.join(", ")}.`
      });
    }

    const courts = sport
      ? await all("SELECT * FROM courts WHERE sport = ? ORDER BY id", [sport])
      : await all("SELECT * FROM courts ORDER BY id");

    res.status(200).json(courts);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve courts." });
  }
});

// GET /courts/:id
router.get("/:id", async (req, res) => {
  try {
    const court = await get("SELECT * FROM courts WHERE id = ?", [req.params.id]);
    if (!court) return res.status(404).json({ error: "Court not found." });
    res.status(200).json(court);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve court." });
  }
});

// POST /courts
router.post("/", async (req, res) => {
  const { name, sport } = req.body || {};
  const errors = validateCourt(name, sport);
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  try {
    const result = await run(
      "INSERT INTO courts (name, sport) VALUES (?, ?)",
      [name.trim(), sport]
    );
    const newCourt = await get("SELECT * FROM courts WHERE id = ?", [result.id]);
    res.status(201).json(newCourt);
  } catch (error) {
    res.status(500).json({ error: "Failed to create court." });
  }
});

// PUT /courts/:id
router.put("/:id", async (req, res) => {
  const { name, sport } = req.body || {};
  const errors = validateCourt(name, sport);
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  try {
    const existing = await get("SELECT id FROM courts WHERE id = ?", [req.params.id]);
    if (!existing) return res.status(404).json({ error: "Court not found." });

    await run(
      "UPDATE courts SET name = ?, sport = ? WHERE id = ?",
      [name.trim(), sport, req.params.id]
    );
    const updated = await get("SELECT * FROM courts WHERE id = ?", [req.params.id]);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update court." });
  }
});

// DELETE /courts/:id
router.delete("/:id", async (req, res) => {
  try {
    const existing = await get("SELECT id FROM courts WHERE id = ?", [req.params.id]);
    if (!existing) return res.status(404).json({ error: "Court not found." });

    await run("DELETE FROM courts WHERE id = ?", [req.params.id]);
    res.status(200).json({ message: "Court deleted successfully." });
  } catch (error) {
    if (error.message.includes("FOREIGN KEY")) {
      return res.status(409).json({
        error: "This court has reservations and cannot be deleted."
      });
    }
    res.status(500).json({ error: "Failed to delete court." });
  }
});

module.exports = router;
