# SunnyCourts Club — Backend Group Assignment

A Node.js + Express + SQLite REST API for managing players, courts and reservations.

## 1. Install the requirements

Install:
- Node.js (LTS): https://nodejs.org/
- Visual Studio Code: https://code.visualstudio.com/
- Postman (for API testing): https://www.postman.com/downloads/
- DB Browser for SQLite (optional, to view the database): https://sqlitebrowser.org/dl/

You do **not** need to install SQLite separately. The project uses the `sqlite3` npm package.

## 2. Open and run

1. Extract the ZIP file.
2. Open the extracted `sunnycourts-club` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run:

```bash
npm install
npm run dev
```

If nodemon does not start, use `npm start`.

You should see a message that the API is running at `http://localhost:3000`.

Keep the terminal running while testing.

## 3. Test in a browser or Postman

Open `http://localhost:3000` to see the API welcome message.

### Courts

| Method | URL | Purpose |
|---|---|---|
| GET | `http://localhost:3000/courts` | Get all courts |
| GET | `http://localhost:3000/courts/1` | Get one court |
| POST | `http://localhost:3000/courts` | Add a court |
| PUT | `http://localhost:3000/courts/1` | Update a court |
| DELETE | `http://localhost:3000/courts/1` | Delete a court |
| GET | `http://localhost:3000/courts?sport=Tennis` | Search by sport |

POST and PUT JSON body:

```json
{
  "name": "Court D",
  "sport": "Tennis"
}
```

Allowed sports are exactly `Tennis`, `Badminton`, and `Squash`.
An invalid sport returns HTTP 400 and explains the allowed values.

### Players

| Method | URL | Purpose |
|---|---|---|
| GET | `http://localhost:3000/players` | Get all players |
| GET | `http://localhost:3000/players/1` | Get one player |
| POST | `http://localhost:3000/players` | Add a player |

POST JSON body:

```json
{
  "name": "Rohan",
  "email": "rohan@example.com",
  "phone": "9876543210"
}
```

### Reservations

| Method | URL | Purpose |
|---|---|---|
| GET | `http://localhost:3000/reservations` | Get all reservations |
| GET | `http://localhost:3000/reservations/1` | Get one reservation |
| POST | `http://localhost:3000/reservations` | Add a reservation |
| PUT | `http://localhost:3000/reservations/1` | Update a reservation |
| DELETE | `http://localhost:3000/reservations/1` | Delete a reservation |
| GET | `http://localhost:3000/reservations/details` | JOIN player and court names |

POST and PUT JSON body:

```json
{
  "player_id": 1,
  "court_id": 1,
  "booking_date": "2026-11-20",
  "booking_time": "18:00",
  "status": "Booked"
}
```

Allowed reservation statuses: `Booked`, `Cancelled`, `Completed`.

## 4. HTTP status codes used

- `200 OK` — successful GET, update or delete.
- `201 Created` — record created.
- `400 Bad Request` — invalid input or invalid sport.
- `404 Not Found` — requested record or route does not exist.
- `409 Conflict` — duplicate player email or court with reservations cannot be deleted.
- `500 Internal Server Error` — unexpected server/database error.

## 5. Database

On first run, the app creates `data/sunnycourts.db` and the three tables:
- `players`
- `courts`
- `reservations`

A few sample records are inserted automatically only when the tables are empty. The database file is generated when you run the app; it is not necessary to create it manually.

## 6. Suggested demo order

1. GET all courts.
2. POST a court with sport `Tennis` (expect 201).
3. POST a court with sport `Other` (expect 400 and allowed values).
4. PUT the new court and change its sport to `Badminton` (expect 200).
5. GET `/courts?sport=Badminton`.
6. GET `/reservations/details` to demonstrate the SQL JOIN.
7. DELETE the new court (expect 200 if it has no reservation).

## 7. Project structure

```text
sunnycourts-club/
├── app.js
├── database.js
├── package.json
├── README.md
├── .gitignore
├── routes/
│   ├── courts.js
│   ├── players.js
│   └── reservations.js
└── data/
    └── (database is created here on first run)
```

## Important

This is a starter implementation for your assignment. Read the code and make sure your group understands it before the demo. Your instructor may ask you to explain routes, middleware, parameterized SQL queries, validation, foreign keys, status codes and the JOIN.
