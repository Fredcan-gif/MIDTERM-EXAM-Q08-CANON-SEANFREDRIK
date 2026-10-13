const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readExpenses() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]');
    return [];
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
  return raw ? JSON.parse(raw) : [];
}

function writeExpenses(expenses) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2));
}

const totalOf = (expenses) =>
  Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) * 100) / 100;

function parseId(value) {
  return /^\d+$/.test(value) ? Number(value) : null;
}

app.get('/api/expenses', (req, res) => {
  const expenses = readExpenses();
  res.status(200).json({ expenses, total: totalOf(expenses) });
});

app.get('/api/expenses/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id must be a number' });

  const expense = readExpenses().find((e) => e.id === id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  res.status(200).json(expense);
});

app.post('/api/expenses', (req, res) => {
  const { description, category, amount, date } = req.body || {};

  if (typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'description is required' });
  }
  if (typeof category !== 'string' || !category.trim()) {
    return res.status(400).json({ error: 'category is required' });
  }

  const parsed = typeof amount === 'string' && amount.trim() !== '' ? Number(amount) : amount;
  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) {
    return res.status(400).json({ error: 'amount must be a number' });
  }
  if (parsed <= 0) {
    return res.status(400).json({ error: 'amount must be greater than 0' });
  }

  const when = date ? new Date(date) : new Date();
  if (Number.isNaN(when.getTime())) {
    return res.status(400).json({ error: 'date is invalid' });
  }

  const expenses = readExpenses();
  const nextId = expenses.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  const expense = {
    id: nextId,
    description: description.trim(),
    category: category.trim(),
    amount: parsed,
    date: when.toISOString().slice(0, 10),
  };
  expenses.push(expense);
  writeExpenses(expenses);
  res.status(201).json({ expense, total: totalOf(expenses) });
});

app.delete('/api/expenses/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id must be a number' });

  const expenses = readExpenses();
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Expense not found' });

  const [deleted] = expenses.splice(index, 1);
  writeExpenses(expenses);
  res.status(200).json({ deleted, total: totalOf(expenses) });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Expense Tracker running on http://localhost:${PORT}`));
}

module.exports = app;
