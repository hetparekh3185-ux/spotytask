/**
 * SPOTITASK — Server-Side Scheduler (lib/scheduler.js)
 * Background worker using node-cron to check and dispatch due email reminders independently.
 */

const cron = require('node-cron');
const taskStore = require('./task-store');
const { sendTaskEmail } = require('./mailer');

let isProcessing = false;

async function checkAndSendDueTasks() {
  if (isProcessing) {
    return { checked: false, reason: 'Previous check cycle still in progress' };
  }
  isProcessing = true;

  try {
    const dueTasks = taskStore.getDueTasks();
    const results = [];

    if (dueTasks.length > 0) {
      console.log(`[Scheduler] 🔍 Found ${dueTasks.length} task(s) due for email alert.`);
    }

    for (const task of dueTasks) {
      const userProfile = taskStore.getUserProfile();
      const recipient = task.userEmail || userProfile.email;

      if (!recipient) {
        console.warn(`[Scheduler] Skipping task "${task.title}" (${task.id}): No recipient email set.`);
        continue;
      }

      console.log(`[Scheduler] ⏰ Task "${task.title}" is due! Dispatching email to ${recipient}...`);

      try {
        const sendResult = await sendTaskEmail({
          to: recipient,
          subject: `⏰ SpotiTask: "${task.title}" is due now!`,
          message: `Your task "${task.title}" is due now. ${task.notes || ''}`,
          task
        });

        if (sendResult.success) {
          taskStore.markEmailSent(task.id, sendResult);
          console.log(`[Scheduler] ✅ Reminder delivered for "${task.title}" (${recipient}) via ${sendResult.provider}`);
          results.push({ taskId: task.id, title: task.title, status: 'sent', provider: sendResult.provider });
        } else {
          console.error(`[Scheduler] ❌ Failed to dispatch email for "${task.title}":`, sendResult.error);
          results.push({ taskId: task.id, title: task.title, status: 'failed', error: sendResult.error });
        }
      } catch (err) {
        console.error(`[Scheduler] ❌ Error processing email for "${task.title}":`, err);
        results.push({ taskId: task.id, title: task.title, status: 'error', error: err.message });
      }
    }

    return {
      checked: true,
      timestamp: new Date().toISOString(),
      dueCount: dueTasks.length,
      sentCount: results.filter(r => r.status === 'sent').length,
      results
    };
  } finally {
    isProcessing = false;
  }
}

function startScheduler() {
  console.log('⏰ Initializing background task scheduler (node-cron: * * * * *)...');
  
  // Runs every minute forever
  const task = cron.schedule('* * * * *', async () => {
    try {
      await checkAndSendDueTasks();
    } catch (err) {
      console.error('[Scheduler] Cron cycle error:', err);
    }
  });

  return task;
}

module.exports = {
  checkAndSendDueTasks,
  startScheduler
};
