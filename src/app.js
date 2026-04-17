const express = require('express');
const { getSupportedCurrencies, formatCurrency } = require('./currencies');
const app = express();

// Authentication middleware
app.use('/api', (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

// Dashboard endpoint
app.get('/api/dashboard', (req, res) => {
  res.json({
    stats: { users: 150, revenue: 45000, growth: 12.5 },
    recentActivity: []
  });
});

// Reports endpoint with timezone-aware date handling
app.get('/api/reports', (req, res) => {
  const tz = req.query.timezone || 'UTC';
  res.json({ reports: [], timezone: tz });
});

// User preferences
app.get('/api/preferences', (req, res) => {
  res.json({
    language: 'en',
    timezone: 'UTC',
    theme: 'light',
    notifications: {
      email: true,
      slack: false,
      weekly_digest: true,
      release_alerts: true
    }
  });
});

app.put('/api/preferences', (req, res) => {
  res.json({ updated: true });
});

// Notification preferences
app.get('/api/notifications/settings', (req, res) => {
  res.json({
    channels: ['email', 'slack', 'in_app'],
    preferences: {
      release_alerts: { email: true, slack: false, in_app: true },
      weekly_digest: { email: true, slack: false, in_app: false },
      security_alerts: { email: true, slack: true, in_app: true }
    }
  });
});

app.put('/api/notifications/settings', (req, res) => {
  res.json({ updated: true });
});

// Invoice export with batch support and progress tracking
app.get('/api/invoices/export', (req, res) => {
  const format = req.query.format || 'pdf';
  const ids = req.query.ids ? req.query.ids.split(',') : [];
  res.json({ status: 'generating', format, count: ids.length, progress: 0 });
});

// Batch invoice export
app.post('/api/invoices/export/batch', (req, res) => {
  const { invoiceIds, format = 'pdf' } = req.body;
  res.json({ jobId: Date.now(), status: 'queued', count: invoiceIds?.length || 0 });
});

// Supported currencies endpoint
app.get('/api/currencies', (req, res) => {
  res.json({ currencies: getSupportedCurrencies() });
});

// Format currency amount
app.get('/api/currencies/format', (req, res) => {
  const { amount, currency } = req.query;
  if (!amount || !currency) {
    return res.status(400).json({ error: 'amount and currency are required' });
  }
  res.json({ formatted: formatCurrency(parseFloat(amount), currency) });
});

module.exports = app;
