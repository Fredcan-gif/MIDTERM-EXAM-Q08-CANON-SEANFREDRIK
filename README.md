# Expense Tracker (Midterm Exam Q08)

Personal Expense Tracking System built with Node.js + Express. Data is stored in `data.json`.

## Run

```
npm install
npm start
```

Open http://localhost:3000

## API

| Method | Endpoint            | Description                          | Success | Errors   |
|--------|---------------------|--------------------------------------|---------|----------|
| GET    | `/api/expenses`     | All expenses plus `total`            | 200     | 500      |
| GET    | `/api/expenses/:id` | One expense by ID                    | 200     | 400, 404 |
| POST   | `/api/expenses`     | Insert (`amount` must be > 0)        | 201     | 400      |
| DELETE | `/api/expenses/:id` | Delete; response has updated `total` | 200     | 400, 404 |

Expense fields: `id`, `description`, `category`, `amount`, `date`.

No UPDATE / PUT / PATCH routes are implemented.
