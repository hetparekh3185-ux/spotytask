require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sendEmailHandler = require('./api/send-email');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static assets
app.use(express.static(__dirname));

// Mount send-email endpoint for both /api/send-email and /send-email
const emailRoute = async (req, res) => {
  try {
    await sendEmailHandler(req, res);
  } catch (err) {
    console.error('Server error in email route:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

app.post('/api/send-email', emailRoute);
app.post('/send-email', emailRoute);

// Root fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎵 SpotiTask server running at http://localhost:${PORT}`);
  console.log(`✉️ Email API active at http://localhost:${PORT}/api/send-email`);
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ WARNING: RESEND_API_KEY is not set in .env!');
  } else {
    console.log('✅ RESEND_API_KEY loaded.');
  }
});
