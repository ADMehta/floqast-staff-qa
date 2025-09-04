import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// =========================
// In-memory stores for mock data
// =========================
// Explicit Record<string, any> typing fixes TS7015 errors
const users: Record<string, any> = {};
const transactions: Record<string, any> = {};
const idemStore: Record<string, any> = {}; // For idempotency keys

// =========================
// USERS: CREATE
// =========================
app.post('/api/users', (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'unauthorized' });
  }

  const { name, email, accountType } = req.body || {};

  if (!name || !email || !accountType) {
    return res.status(400).json({ message: 'missing required fields' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ message: 'email invalid' });
  }

  if (!['basic', 'premium'].includes(accountType)) {
    return res.status(400).json({ message: 'invalid accountType' });
  }

  if (Object.values(users).some(u => u.email === email)) {
    return res.status(409).json({ message: 'email exists' });
  }

  const id = 'u-' + Math.random().toString(36).slice(2);
  users[id] = { id, name, email, accountType };
  return res.status(201).json(users[id]);
});


// =========================
// USERS: GET
// =========================
app.get('/api/users/:id', (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'unauthorized' });
  }
  const user = users[req.params.id];
  if (!user) return res.status(404).json({ message: 'not found' });
  return res.status(200).json(user);
});

// =========================
// USERS: UPDATE
// =========================
app.put('/api/users/:id', (req, res) => {
  if (!req.headers.authorization) return res.status(401).json({ message: 'unauthorized' });

  const user = users[req.params.id];
  if (!user) return res.status(404).json({ message: 'not found' });

  const { name, email, accountType } = req.body || {};
  if (email && !email.includes('@')) return res.status(400).json({ message: 'email invalid' });
  if (accountType && !['basic', 'premium'].includes(accountType)) {
    return res.status(400).json({ message: 'invalid accountType' });
  }
  if (email && Object.values(users).some(u => u.email === email && u.id !== user.id)) {
    return res.status(409).json({ message: 'email exists' });
  }

  users[req.params.id] = { ...user, ...(name && { name }), ...(email && { email }), ...(accountType && { accountType }) };
  return res.status(200).json(users[req.params.id]);
});

// =========================
// USERS: DELETE
// =========================
app.delete('/api/users/:id', (req, res) => {
  if (!req.headers.authorization) return res.status(401).json({ message: 'unauthorized' });
  if (!users[req.params.id]) return res.status(404).json({ message: 'not found' });
  delete users[req.params.id];
  return res.status(204).send();
});

// =========================
// TRANSACTIONS: CREATE
// =========================
app.post('/api/transactions', (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'unauthorized' });
  }

  const { userId, amount, type, recipientId } = req.body || {};

  if (!userId || amount === undefined || !type) {
    return res.status(400).json({ message: 'missing required fields' });
  }

  if (!users[userId]) {
    return res.status(404).json({ message: 'user not found' });
}
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'amount must be > 0' });
  }

  if (!['transfer', 'deposit', 'withdrawal'].includes(type)) {
    return res.status(400).json({ message: 'invalid transaction type' });
  }

  if (type === 'transfer') {
    if (!recipientId) return res.status(400).json({ message: 'recipient required' });
    if (recipientId === userId) return res.status(400).json({ message: 'cannot transfer to self' });
  }

  if (!users[userId]) {
    return res.status(404).json({ message: 'user not found' });
  }

  const id = 't-' + Math.random().toString(36).slice(2);
  transactions[id] = { id, userId, amount, type, recipientId };
  return res.status(201).json(transactions[id]);
});


// =========================
// TRANSACTIONS: LIST BY USER
// =========================
app.get('/api/transactions/:userId', (req, res) => {
  if (!req.headers.authorization) return res.status(401).json({ message: 'unauthorized' });
  const list = Object.values(transactions).filter(t => t.userId === req.params.userId);
  return res.status(200).json(list);
});

// =========================
// RESET ENDPOINT
// =========================
app.post('/__reset', (_req, res) => {
  for (const k of Object.keys(users)) delete users[k];
  for (const k of Object.keys(transactions)) delete transactions[k];
  for (const k of Object.keys(idemStore)) delete idemStore[k];
  return res.status(204).send();
});

// =========================
// START SERVER
// =========================
app.listen(3001, () => {
  console.log('Mock API server running at http://localhost:3001');
});