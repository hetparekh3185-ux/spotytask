/**
 * SPOTITASK — Vercel Serverless Function
 * POST /api/send-email — sends real email via Resend API
 */

const { Resend } = require('resend');

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_your_api_key_here') {
    return res.status(500).json({
      error: 'RESEND_API_KEY is not configured. Add it in Vercel project settings → Environment Variables.'
    });
  }

  const { to, subject, message, task } = req.body || {};

  if (!to) {
    return res.status(400).json({ error: 'Missing required field: to (email address)' });
  }

  const resend = new Resend(apiKey);

  // Build a beautiful Spotify-themed HTML email
  const taskTitle = (task && task.title) || subject || 'Task Reminder';
  const taskNotes = (task && task.notes) || message || '';
  const taskCategory = (task && task.category) || 'work';
  const taskDue = (task && task.dueTime) ? new Date(task.dueTime).toLocaleString() : 'Now';

  const categoryEmojis = {
    work: '💼', study: '📚', fitness: '🏋️', personal: '🌿', creative: '🎨', urgent: '🔥'
  };
  const emoji = categoryEmojis[taskCategory] || '⏰';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SpotiTask Reminder</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#121212;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1db954 0%,#17a347 100%);padding:32px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:32px;">${emoji}</p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">SpotiTask Alert</h1>
              <p style="margin:8px 0 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Your task is due right now</p>
            </td>
          </tr>

          <!-- Task Card -->
          <tr>
            <td style="padding:32px;">
              <div style="background:#282828;border-radius:12px;padding:24px;border-left:4px solid #1db954;">
                <p style="margin:0 0 6px 0;color:#1db954;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Task Due</p>
                <h2 style="margin:0 0 12px 0;color:#ffffff;font-size:22px;font-weight:700;">${taskTitle}</h2>
                ${taskNotes ? `<p style="margin:0 0 16px 0;color:#b3b3b3;font-size:15px;line-height:1.6;">${taskNotes}</p>` : ''}
                <div style="display:flex;gap:16px;flex-wrap:wrap;">
                  <span style="background:#1a1a1a;color:#1db954;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600;display:inline-block;">
                    📅 ${taskDue}
                  </span>
                  <span style="background:#1a1a1a;color:#b3b3b3;padding:6px 12px;border-radius:20px;font-size:12px;display:inline-block;text-transform:capitalize;">
                    ${emoji} ${taskCategory}
                  </span>
                </div>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 32px 32px;text-align:center;">
              <a href="#" style="display:inline-block;background:#1db954;color:#000000;padding:14px 36px;border-radius:30px;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.3px;">Mark as Complete</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #282828;text-align:center;">
              <p style="margin:0;color:#535353;font-size:12px;">Sent by <strong style="color:#1db954;">SpotiTask</strong> · Your Spotify-themed task manager</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'SpotiTask <onboarding@resend.dev>';
    const result = await resend.emails.send({
      from: fromAddress,
      to: to,
      subject: subject || `⏰ SpotiTask: "${taskTitle}" is due now!`,
      text: `SpotiTask Reminder\n\n${emoji} ${taskTitle}\n${taskNotes ? taskNotes + '\n' : ''}Due: ${taskDue}\n\nThis reminder was sent by SpotiTask.`,
      html: htmlBody
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      const isDomainRestriction = result.error.statusCode === 403 || (result.error.message && result.error.message.includes('only send testing emails'));
      return res.status(result.error.statusCode || 400).json({
        success: false,
        error: result.error.message || 'Resend failed to send email',
        name: result.error.name,
        statusCode: result.error.statusCode,
        hint: isDomainRestriction
          ? 'Free tier only allows sending to your Resend registered account email. To send to any recipient, verify your domain at resend.com/domains.'
          : 'Check the email address and your Resend dashboard logs.'
      });
    }

    return res.status(200).json({
      success: true,
      id: result.data?.id,
      message: 'Email delivered to recipient via Resend API'
    });
  } catch (err) {
    console.error('Resend execution error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while sending email',
      hint: 'Make sure your RESEND_API_KEY is valid in environment variables.'
    });
  }
};
