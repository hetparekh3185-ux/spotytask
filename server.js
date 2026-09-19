require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sendEmailHandler = require('./api/send-email');
const taskStore = require('./lib/task-store');
const { startScheduler, checkAndSendDueTasks } = require('./lib/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static assets
app.use(express.static(__dirname));

// =========================================================================
// KEEP-ALIVE & HEALTH ENDPOINTS (FOR CRON-JOB.ORG / UPTIMEROBOT / RENDER)
// =========================================================================
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    storedTasksCount: taskStore.getAllTasks().length,
    timestamp: new Date().toISOString()
  });
});

// =========================================================================
// EMAIL API ROUTES
// =========================================================================
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

// =========================================================================
// TASK SYNC & STORAGE API
// =========================================================================
app.get('/api/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    tasks: taskStore.getAllTasks(),
    user: taskStore.getUserProfile()
  });
});

app.post('/api/tasks/sync', (req, res) => {
  try {
    const { tasks, user } = req.body || {};
    const result = taskStore.syncTasks(tasks || [], user || {});
    res.status(200).json({
      success: true,
      tasks: result.tasks,
      user: result.user
    });
  } catch (err) {
    console.error('Error syncing tasks:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const task = req.body;
    if (!task || !task.id || !task.title) {
      return res.status(400).json({ success: false, error: 'Invalid task object' });
    }
    const updatedTasks = taskStore.saveTask(task);
    res.status(200).json({ success: true, tasks: updatedTasks });
  } catch (err) {
    console.error('Error saving task:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const deleted = taskStore.deleteTask(req.params.id);
    res.status(200).json({ success: true, deleted });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// MANUAL / EXTERNAL CRON TRIGGER
// (Allows cron-job.org or external services to trigger due tasks check on demand)
// =========================================================================
const cronCheckRoute = async (req, res) => {
  try {
    const result = await checkAndSendDueTasks();
    res.status(200).json(result);
  } catch (err) {
    console.error('Error executing cron check route:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

app.get('/api/cron-check', cronCheckRoute);
app.post('/api/cron-check', cronCheckRoute);

// Root fallback to index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Node server and scheduler
app.listen(PORT, () => {
  console.log(`🎵 SpotiTask server running at http://localhost:${PORT}`);
  console.log(`✉️ Email API active at http://localhost:${PORT}/api/send-email`);
  console.log(`💓 Health ping endpoint: http://localhost:${PORT}/ping`);
  console.log(`🔄 Tasks sync API: http://localhost:${PORT}/api/tasks/sync`);
  
  if (!process.env.RESEND_API_KEY && (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD)) {
    console.warn('⚠️ WARNING: Neither RESEND_API_KEY nor GMAIL_USER + GMAIL_APP_PASSWORD is set in .env!');
  } else {
    console.log('✅ Email transport service credentials loaded.');
  }

  // Start the background cron scheduler
  startScheduler();
});
