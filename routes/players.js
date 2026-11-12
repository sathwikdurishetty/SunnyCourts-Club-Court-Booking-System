const express = require("express");
const router = express.Router();
const { run, get, all } = require("../database");

router.get("/", async (req, res) => {
  try {
    const players = await all("SELECT * FROM players ORDER BY id");
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve players." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const player = await get("SELECT * FROM players WHERE id = ?", [req.params.id]);
    if (!player) return res.status(404).json({ error: "Player not found." });
    res.status(200).json(player);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve player." });
  }
});

router.post("/", async (req, res) => {
  const { name, email, phone = null } = req.body || {};
  if (typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "A valid player name and email are required." });
  }

  try {
    const result = await run(
      "INSERT INTO players (name, email, phone) VALUES (?, ?, ?)",
      [name.trim(), email.trim(), phone]
    );
    const player = await get("SELECT * FROM players WHERE id = ?", [result.id]);
    res.status(201).json(player);
  } catch (error) {
    if (error.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "A player with this email already exists." });
    }
    res.status(500).json({ error: "Failed to create player." });
  }
});

module.exports = router;
