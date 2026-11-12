const express = require("express");
const path = require("path");
const { initializeDatabase } = require("./database");

const courtsRouter = require("./routes/courts");
const playersRouter = require("./routes/players");
const reservationsRouter = require("./routes/reservations");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to SunnyCourts Club API",
    endpoints: {
      courts: "/courts",
      players: "/players",
      reservations: "/reservations",
      reservationDetails: "/reservations/details"
    }
  });
});

app.use("/courts", courtsRouter);
app.use("/players", playersRouter);
app.use("/reservations", reservationsRouter);

// Handle invalid JSON bodies.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON in request body." });
  }
  next(err);
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`SunnyCourts API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start the server:", error.message);
    process.exit(1);
  }
}

startServer();
