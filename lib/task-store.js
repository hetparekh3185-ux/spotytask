/**
 * SPOTITASK — Server-Side Task Store (lib/task-store.js)
 * Persistent JSON store for tasks and user profile to support independent background schedulers.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

function ensureStoreExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      tasks: [],
      user: {
        email: '',
        name: '',
        phone: ''
      },
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function getStore() {
  ensureStoreExists();
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('[TaskStore] Error reading tasks file, resetting:', err);
    return { tasks: [], user: {}, lastUpdated: new Date().toISOString() };
  }
}

function saveStore(data) {
  ensureStoreExists();
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[TaskStore] Error writing tasks file:', err);
    return false;
  }
}

function getAllTasks() {
  const store = getStore();
  return store.tasks || [];
}

function getUserProfile() {
  const store = getStore();
  return store.user || {};
}

function saveTask(task) {
  const store = getStore();
  store.tasks = store.tasks || [];

  const existingIndex = store.tasks.findIndex(t => t.id === task.id);
  if (existingIndex >= 0) {
    // Preserve server-side emailSent status if existing was already sent
    const existing = store.tasks[existingIndex];
    store.tasks[existingIndex] = {
      ...existing,
      ...task,
      emailSent: existing.emailSent || task.emailSent || false,
      emailSentAt: existing.emailSentAt || task.emailSentAt || null
    };
  } else {
    store.tasks.push({
      ...task,
      userEmail: task.userEmail || store.user?.email || '',
      emailSent: Boolean(task.emailSent),
      emailSentAt: task.emailSentAt || null
    });
  }

  saveStore(store);
  return store.tasks;
}

function deleteTask(taskId) {
  const store = getStore();
  const initialLen = (store.tasks || []).length;
  store.tasks = (store.tasks || []).filter(t => t.id !== taskId);
  const deleted = store.tasks.length < initialLen;
  if (deleted) {
    saveStore(store);
  }
  return deleted;
}

function syncTasks(incomingTasks = [], userProfile = {}) {
  const store = getStore();
  const existingMap = new Map((store.tasks || []).map(t => [t.id, t]));

  if (userProfile && (userProfile.email || userProfile.name || userProfile.phone)) {
    store.user = {
      ...(store.user || {}),
      ...userProfile
    };
  }

  const defaultEmail = store.user?.email || '';

  const merged = incomingTasks.map(inc => {
    const existing = existingMap.get(inc.id);
    const emailSent = Boolean((existing && existing.emailSent) || inc.emailSent || inc.alertTriggered);
    const emailSentAt = (existing && existing.emailSentAt) || inc.emailSentAt || (emailSent ? new Date().toISOString() : null);

    return {
      ...inc,
      userEmail: inc.userEmail || defaultEmail,
      emailSent,
      emailSentAt
    };
  });

  store.tasks = merged;
  saveStore(store);

  return {
    tasks: store.tasks,
    user: store.user
  };
}

function getDueTasks(maxAgeMs = 24 * 60 * 60 * 1000) {
  const store = getStore();
  const now = Date.now();
  const defaultEmail = store.user?.email || '';

  return (store.tasks || []).filter(task => {
    if (task.completed) return false;
    if (task.emailSent) return false;
    if (task.notifyEmail === false) return false;

    const recipient = task.userEmail || defaultEmail;
    if (!recipient) return false;

    const dueTime = new Date(task.dueDatetime).getTime();
    if (isNaN(dueTime)) return false;

    // Due time has arrived, and is not older than maxAgeMs (avoids spamming stale historical tasks)
    const isDue = now >= dueTime;
    const isRecent = (now - dueTime) <= maxAgeMs;

    return isDue && isRecent;
  });
}

function markEmailSent(taskId, result = {}) {
  const store = getStore();
  const task = (store.tasks || []).find(t => t.id === taskId);
  if (task) {
    task.emailSent = true;
    task.emailSentAt = new Date().toISOString();
    task.emailSendResult = {
      provider: result.provider,
      id: result.id,
      timestamp: new Date().toISOString()
    };
    saveStore(store);
    return true;
  }
  return false;
}

module.exports = {
  getStore,
  saveStore,
  getAllTasks,
  getUserProfile,
  saveTask,
  deleteTask,
  syncTasks,
  getDueTasks,
  markEmailSent
};
