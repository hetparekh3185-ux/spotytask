/**
 * SPOTITASK — Vercel Serverless Function & Express Route Handler
 * POST /api/send-email — sends real email via Resend API or Gmail SMTP
 */

const { sendTaskEmail } = require('../lib/mailer');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, message, task } = req.body || {};

  try {
    const result = await sendTaskEmail({ to, subject, message, task });
    return res.status(result.statusCode || (result.success ? 200 : 500)).json(result);
  } catch (err) {
    console.error('Unhandled error in send-email handler:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while sending email'
    });
  }
};
