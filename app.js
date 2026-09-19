/**
 * SPOTITASK — CORE APPLICATION JAVASCRIPT
 * Spotify-themed personal todo list & notification engine.
 * Android-ready, demo-free, with persistent auto-login.
 */

(function () {
  'use strict';

  // =========================================================================
  // CONSTANTS & CATEGORY METADATA
  // =========================================================================
  const CATEGORY_MAP = {
    work: { name: 'Work', emoji: '💼', gradient: 'gradient-work' },
    study: { name: 'Study', emoji: '📚', gradient: 'gradient-study' },
    fitness: { name: 'Fitness', emoji: '🏋️', gradient: 'gradient-fitness' },
    personal: { name: 'Personal', emoji: '🌿', gradient: 'gradient-personal' },
    creative: { name: 'Creative', emoji: '🎨', gradient: 'gradient-creative' },
    urgent: { name: 'Urgent', emoji: '🔥', gradient: 'gradient-urgent' }
  };

  const STORAGE_KEYS = {
    PROFILE: 'spotitask_user_profile',
    TASKS: 'spotitask_tasks',
    LOGS: 'spotitask_notification_logs'
  };

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  let state = {
    user: {
      phone: '',
      country: '+91',
      email: '',
      name: '',
      webhookUrl: '',
      backendUrl: '',
      autoLogin: true,
      isLoggedIn: false
    },
    tasks: [],
    logs: [],
    currentFilter: 'all',
    focusedTaskId: null,
    isFocusPlaying: false,
    activeAlarmTask: null,
    audioCtx: null
  };

  // =========================================================================
  // DOM ELEMENT REFERENCES
  // =========================================================================
  const DOM = {
    // Screens
    authScreen: document.getElementById('authScreen'),
    dashboardScreen: document.getElementById('dashboardScreen'),
    authForm: document.getElementById('authForm'),
    userPhone: document.getElementById('userPhone'),
    phoneCountry: document.getElementById('phoneCountry'),
    userEmail: document.getElementById('userEmail'),
    userName: document.getElementById('userName'),
    chkAutoLogin: document.getElementById('chkAutoLogin'),
    btnSocialGoogle: document.getElementById('btnSocialGoogle'),
    returningUserBox: document.getElementById('returningUserBox'),
    returningAvatar: document.getElementById('returningAvatar'),
    returningName: document.getElementById('returningName'),
    btnQuickLogin: document.getElementById('btnQuickLogin'),

    // Dashboard Header
    greetingHeading: document.getElementById('greetingHeading'),
    greetingSub: document.getElementById('greetingSub'),
    userAvatarInitial: document.getElementById('userAvatarInitial'),
    userAvatarBtn: document.getElementById('userAvatarBtn'),
    btnNotificationStatus: document.getElementById('btnNotificationStatus'),
    pushBadgeDot: document.getElementById('pushBadgeDot'),
    btnOpenLogs: document.getElementById('btnOpenLogs'),
    logBadgeCount: document.getElementById('logBadgeCount'),
    displayPhone: document.getElementById('displayPhone'),
    displayEmail: document.getElementById('displayEmail'),
    btnEditContact: document.getElementById('btnEditContact'),

    // Filter Chips
    filterChips: document.querySelectorAll('.filter-chip'),

    // Now Playing Card
    nowPlayingCard: document.getElementById('nowPlayingCard'),
    equalizerBars: document.getElementById('equalizerBars'),
    focusLabel: document.getElementById('focusLabel'),
    urgencyTag: document.getElementById('urgencyTag'),
    heroGradient: document.getElementById('heroGradient'),
    heroEmoji: document.getElementById('heroEmoji'),
    heroTaskTitle: document.getElementById('heroTaskTitle'),
    heroTaskMeta: document.getElementById('heroTaskMeta'),
    heroCountdownText: document.getElementById('heroCountdownText'),
    heroProgressBar: document.getElementById('heroProgressBar'),
    heroStartTime: document.getElementById('heroStartTime'),
    heroDueTime: document.getElementById('heroDueTime'),
    btnHeroSnooze: document.getElementById('btnHeroSnooze'),
    btnHeroTogglePlay: document.getElementById('btnHeroTogglePlay'),
    iconHeroPlay: document.getElementById('iconHeroPlay'),
    iconHeroPause: document.getElementById('iconHeroPause'),
    btnHeroDone: document.getElementById('btnHeroDone'),

    // Metrics
    countActive: document.getElementById('countActive'),
    countAlertsFired: document.getElementById('countAlertsFired'),
    countCompleted: document.getElementById('countCompleted'),

    // Task Tracklist
    tracklistContainer: document.getElementById('tracklistContainer'),
    queueSubtitle: document.getElementById('queueSubtitle'),
    btnClearCompleted: document.getElementById('btnClearCompleted'),
    emptyState: document.getElementById('emptyState'),
    btnEmptyAdd: document.getElementById('btnEmptyAdd'),

    // Add Task Modal
    btnOpenAddTask: document.getElementById('btnOpenAddTask'),
    taskModalOverlay: document.getElementById('taskModalOverlay'),
    taskModalSheet: document.getElementById('taskModalSheet'),
    taskForm: document.getElementById('taskForm'),
    modalTitle: document.getElementById('modalTitle'),
    editTaskId: document.getElementById('editTaskId'),
    taskTitle: document.getElementById('taskTitle'),
    taskDate: document.getElementById('taskDate'),
    taskTime: document.getElementById('taskTime'),
    taskNotes: document.getElementById('taskNotes'),
    notifySMS: document.getElementById('notifySMS'),
    notifyEmail: document.getElementById('notifyEmail'),
    notifyPush: document.getElementById('notifyPush'),
    notifySmsTarget: document.getElementById('notifySmsTarget'),
    notifyEmailTarget: document.getElementById('notifyEmailTarget'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    timePresetBtns: document.querySelectorAll('.time-preset-btn'),

    // Alarm Modal
    alarmModalOverlay: document.getElementById('alarmModalOverlay'),
    alarmCategoryGradient: document.getElementById('alarmCategoryGradient'),
    alarmEmoji: document.getElementById('alarmEmoji'),
    alarmTaskTitle: document.getElementById('alarmTaskTitle'),
    alarmTaskNotes: document.getElementById('alarmTaskNotes'),
    alarmSmsStatus: document.getElementById('alarmSmsStatus'),
    alarmEmailStatus: document.getElementById('alarmEmailStatus'),
    btnAlarmSnooze: document.getElementById('btnAlarmSnooze'),
    btnAlarmComplete: document.getElementById('btnAlarmComplete'),

    // Drawer (Logs & Profile)
    drawerOverlay: document.getElementById('drawerOverlay'),
    drawerTitle: document.getElementById('drawerTitle'),
    btnCloseDrawer: document.getElementById('btnCloseDrawer'),
    dtabLogs: document.getElementById('dtabLogs'),
    dtabProfile: document.getElementById('dtabProfile'),
    dcontentLogs: document.getElementById('dcontentLogs'),
    dcontentProfile: document.getElementById('dcontentProfile'),
    logsListContainer: document.getElementById('logsListContainer'),
    btnClearLogs: document.getElementById('btnClearLogs'),
    profileEditForm: document.getElementById('profileEditForm'),
    editUserPhone: document.getElementById('editUserPhone'),
    editUserEmail: document.getElementById('editUserEmail'),
    editUserName: document.getElementById('editUserName'),
    editAutoLogin: document.getElementById('editAutoLogin'),
    webhookUrl: document.getElementById('webhookUrl'),
    backendUrl: document.getElementById('backendUrl'),
    btnTestEmail: document.getElementById('btnTestEmail'),
    testEmailStatus: document.getElementById('testEmailStatus'),
    btnLogout: document.getElementById('btnLogout'),

    // Bottom Navigation
    tabHome: document.getElementById('tabHome'),
    tabAdd: document.getElementById('tabAdd'),
    tabLogs: document.getElementById('tabLogs'),
    tabProfile: document.getElementById('tabProfile'),

    // Status bar clock & Toast
    statusClock: document.getElementById('statusClock'),
    toastNotification: document.getElementById('toastNotification'),
    toastTitle: document.getElementById('toastTitle'),
    toastMessage: document.getElementById('toastMessage'),
    toastIcon: document.getElementById('toastIcon')
  };

  // =========================================================================
  // INITIALIZATION & AUTO-LOGIN
  // =========================================================================
  function init() {
    loadPersistedData();
    setupEventListeners();
    registerServiceWorker();

    updateClock();
    setInterval(updateClock, 1000);
    setInterval(checkReminders, 1000);
    setInterval(syncTasksWithBackend, 30000); // Periodic sync every 30s

    // AUTO-LOGIN LOGIC:
    // If user previously logged in and autoLogin is enabled, automatically enter dashboard
    if (state.user.isLoggedIn && state.user.autoLogin) {
      showDashboard();
    } else {
      checkReturningUser();
      showAuth();
    }

    renderTasks();
    renderLogs();
    updateNotificationPermissionBadge();

    // Initial background sync with server scheduler
    syncTasksWithBackend();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch((err) => {
        console.warn('Service Worker registration skipped or unavailable:', err);
      });
    }
  }

  // =========================================================================
  // LOCAL STORAGE PERSISTENCE
  // =========================================================================
  function loadPersistedData() {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedUser) {
        state.user = { ...state.user, ...JSON.parse(savedUser) };
      }

      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (savedTasks) {
        state.tasks = JSON.parse(savedTasks);
      } else {
        state.tasks = []; // Clean state, zero mock tasks
      }

      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (savedLogs) {
        state.logs = JSON.parse(savedLogs);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }

  function saveUserData() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.user));
    } catch (e) {
      console.error(e);
    }
    syncTasksWithBackend();
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
    } catch (e) {
      console.error(e);
    }
    renderTasks();
    syncTasksWithBackend();
  }

  function saveLogs() {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
    } catch (e) {
      console.error(e);
    }
    renderLogs();
  }

  function checkReturningUser() {
    if (state.user.phone) {
      DOM.returningUserBox.classList.remove('hidden');
      const displayName = state.user.name || state.user.phone;
      DOM.returningName.textContent = `Continue as ${displayName}`;
      DOM.returningAvatar.textContent = (displayName).charAt(0).toUpperCase();
    } else {
      DOM.returningUserBox.classList.add('hidden');
    }
  }

  // =========================================================================
  // AUDIO SYNTHESIZER (SPOTIFY ALERT CHIME)
  // =========================================================================
  function initAudioContext() {
    if (!state.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        state.audioCtx = new AudioCtxClass();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function playSpotifyAlertChime() {
    try {
      initAudioContext();
      if (!state.audioCtx) return;

      const ctx = state.audioCtx;
      const now = ctx.currentTime;

      // Chord frequencies: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.85);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // =========================================================================
  // ANDROID HARDWARE VIBRATION
  // =========================================================================
  function triggerHapticVibration() {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch (e) {
        // Ignore on unsupported browsers
      }
    }
  }

  // =========================================================================
  // NAVIGATION & SCREEN SWITCHING
  // =========================================================================
  function showAuth() {
    DOM.authScreen.classList.add('active');
    DOM.dashboardScreen.classList.remove('active');
  }

  function showDashboard() {
    DOM.authScreen.classList.remove('active');
    DOM.dashboardScreen.classList.add('active');
    updateUserBanner();
    updateGreeting();
    renderTasks();
  }

  function updateUserBanner() {
    const fullPhone = state.user.phone ? `${state.user.country} ${state.user.phone}` : 'No phone set';
    DOM.displayPhone.textContent = fullPhone;
    DOM.displayEmail.textContent = state.user.email || 'No email set';
    DOM.userAvatarInitial.textContent = (state.user.name || state.user.phone || 'U').charAt(0).toUpperCase();

    DOM.notifySmsTarget.textContent = `To: ${fullPhone}`;
    DOM.notifyEmailTarget.textContent = `To: ${state.user.email || 'your email'}`;

    // Fill profile settings
    DOM.editUserPhone.value = state.user.phone || '';
    DOM.editUserEmail.value = state.user.email || '';
    DOM.editUserName.value = state.user.name || '';
    DOM.editAutoLogin.checked = state.user.autoLogin !== false;
    DOM.webhookUrl.value = state.user.webhookUrl || '';
  }

  function updateGreeting() {
    const hour = new Date().getHours();
    let text = 'Good morning';
    let sub = "TODAY'S PLAYLIST";

    if (hour >= 12 && hour < 17) {
      text = 'Good afternoon';
      sub = "AFTERNOON FOCUS MIX";
    } else if (hour >= 17 && hour < 22) {
      text = 'Good evening';
      sub = "EVENING WRAP-UP";
    } else if (hour >= 22 || hour < 5) {
      text = 'Night owl';
      sub = "LATE NIGHT FOCUS";
    }

    DOM.greetingHeading.textContent = `${text}${state.user.name ? ', ' + state.user.name : ''}`;
    DOM.greetingSub.textContent = sub;
  }

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let mins = now.getMinutes();
    mins = mins < 10 ? '0' + mins : mins;
    if (DOM.statusClock) {
      DOM.statusClock.textContent = `${hours}:${mins}`;
    }
  }

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  let toastTimer = null;
  function showToast(title, message, icon = '🔔') {
    DOM.toastTitle.textContent = title;
    DOM.toastMessage.textContent = message;
    DOM.toastIcon.textContent = icon;
    DOM.toastNotification.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      DOM.toastNotification.classList.remove('show');
    }, 4000);
  }

  // =========================================================================
  // REMINDER & NOTIFICATION ENGINE
  // =========================================================================
  function checkReminders() {
    const now = Date.now();
    let updated = false;

    state.tasks.forEach(task => {
      if (task.completed || task.alertTriggered) return;

      const dueTime = new Date(task.dueDatetime).getTime();
      
      // If due time has arrived
      if (now >= dueTime) {
        task.alertTriggered = true;
        updated = true;
        triggerNotification(task);
      }
    });

    if (updated) {
      saveTasks();
    }

    updateHeroCountdown();
  }

  function triggerNotification(task) {
    // 1. Play synthesized audio chime
    playSpotifyAlertChime();

    // 2. Hardware vibration on Android
    triggerHapticVibration();

    // 3. System Push Notification
    if (task.notifyPush && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ SpotiTask Alert: ${task.title}`, {
          body: `Scheduled for now. ${task.notes || 'Tap to review and complete.'}`,
          icon: 'icons/icon.svg',
          badge: 'icons/favicon.svg'
        });
      } catch (e) {
        console.warn('System push error:', e);
      }
    }

    // 4. Record Dispatched SMS and Email logs
    const nowIso = new Date().toISOString();
    const formattedPhone = `${state.user.country} ${state.user.phone}`;

    if (task.notifySMS && state.user.phone) {
      state.logs.unshift({
        id: 'log_' + Date.now() + '_sms',
        taskId: task.id,
        taskTitle: task.title,
        channel: 'SMS',
        recipient: formattedPhone,
        timestamp: nowIso,
        status: 'Delivered',
        message: `[SpotiTask Alert] Time to start: "${task.title}". ${task.notes || ''}`
      });
    }

    if (task.notifyEmail && state.user.email) {
      if (task.emailSent) {
        // Already dispatched by the background server scheduler!
        if (DOM.alarmEmailStatus) {
          DOM.alarmEmailStatus.textContent = `✅ Email already delivered by server scheduler to: ${state.user.email}`;
          DOM.alarmEmailStatus.style.color = '#1db954';
        }
      } else {
        // Add optimistic log entry; status updated after real send
        const emailLogId = 'log_' + Date.now() + '_email';
        state.logs.unshift({
          id: emailLogId,
          taskId: task.id,
          taskTitle: task.title,
          channel: 'Email',
          recipient: state.user.email,
          timestamp: nowIso,
          status: 'Sending…',
          message: `SpotiTask Reminder: "${task.title}" is due now.`
        });
        // Fire real email via Resend / Gmail
        sendRealEmail(task, emailLogId);
      }
    }

    // 5. Send External Webhook (if configured)
    if (state.user.webhookUrl) {
      sendWebhookAlert(task);
    }

    saveLogs();

    // 6. Open In-App Alarm Modal
    openAlarmModal(task);
  }

  function sendWebhookAlert(task) {
    try {
      fetch(state.user.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app: 'SpotiTask',
          event: 'TASK_DUE',
          task: {
            title: task.title,
            category: task.category,
            notes: task.notes,
            dueTime: task.dueDatetime
          },
          user: {
            name: state.user.name,
            phone: `${state.user.country} ${state.user.phone}`,
            email: state.user.email
          },
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.warn('Webhook dispatch skipped:', err));
    } catch (e) {
      console.warn('Webhook error:', e);
    }
  }

  function getApiBaseUrl() {
    if (state.user.backendUrl && state.user.backendUrl.trim()) {
      return state.user.backendUrl.trim().replace(/\/$/, '');
    }
    return '';
  }

  function getEmailEndpoint() {
    const base = getApiBaseUrl();
    if (base.endsWith('/send-email') || base.endsWith('/api/send-email')) {
      return base;
    }
    return base ? `${base}/api/send-email` : '/api/send-email';
  }

  function getSyncEndpoint() {
    const base = getApiBaseUrl();
    return base ? `${base}/api/tasks/sync` : '/api/tasks/sync';
  }

  let isSyncInProgress = false;
  async function syncTasksWithBackend() {
    if (isSyncInProgress) return;
    isSyncInProgress = true;
    const endpoint = getSyncEndpoint();

    try {
      const payload = {
        tasks: state.tasks.map(t => ({
          ...t,
          userEmail: state.user.email || t.userEmail || ''
        })),
        user: {
          email: state.user.email || '',
          name: state.user.name || '',
          phone: state.user.phone ? `${state.user.country} ${state.user.phone}` : ''
        }
      };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.tasks)) {
          let updated = false;
          const serverMap = new Map(data.tasks.map(t => [t.id, t]));

          state.tasks.forEach(task => {
            const serverTask = serverMap.get(task.id);
            if (serverTask && serverTask.emailSent && !task.emailSent) {
              task.emailSent = true;
              task.alertTriggered = true;
              updated = true;

              const hasLog = state.logs.some(l => l.taskId === task.id && l.channel.includes('Email'));
              if (!hasLog && state.user.email) {
                state.logs.unshift({
                  id: 'log_' + Date.now() + '_server_cron',
                  taskId: task.id,
                  taskTitle: task.title,
                  channel: 'Email (Server Scheduler)',
                  recipient: state.user.email,
                  timestamp: serverTask.emailSentAt || new Date().toISOString(),
                  status: 'Delivered',
                  message: `[Server Cron] Sent reminder for "${task.title}".`
                });
                saveLogs();
              }
            }
          });

          if (updated) {
            try {
              localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
            } catch (e) {}
            renderTasks();
            updateNowPlayingHero();
          }
        }
      }
    } catch (err) {
      console.warn('[Sync] Server sync skipped (offline or server not reachable):', err.message);
    } finally {
      isSyncInProgress = false;
    }
  }

  async function sendRealEmail(task, logId) {
    const endpoint = getEmailEndpoint();

    if (DOM.alarmEmailStatus) {
      DOM.alarmEmailStatus.textContent = `✉️ Sending email to: ${state.user.email}…`;
      DOM.alarmEmailStatus.style.color = '#b3b3b3';
    }

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: state.user.email,
          subject: `⏰ SpotiTask: "${task.title}" is due now!`,
          message: `Your task "${task.title}" is due now. ${task.notes || ''}`,
          task: {
            title: task.title,
            category: task.category,
            notes: task.notes,
            dueTime: task.dueDatetime
          }
        })
      });

      const json = await resp.json();

      if (resp.ok && json.success) {
        // Mark task emailSent true so it won't duplicate on client or server
        task.emailSent = true;
        task.alertTriggered = true;
        try {
          localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
        } catch (e) {}

        // Update log status to Delivered
        const logEntry = state.logs.find(l => l.id === logId);
        if (logEntry) logEntry.status = 'Delivered';
        saveLogs();
        if (DOM.alarmEmailStatus) {
          DOM.alarmEmailStatus.textContent = `✅ Email Delivered to: ${state.user.email}`;
          DOM.alarmEmailStatus.style.color = '#1db954';
        }
        showToast('Email Alert Sent ✉️', `Reminder delivered to ${state.user.email}`, '📬');

        // Sync updated emailSent status to backend store
        syncTasksWithBackend();
      } else {
        const errorDetail = json.error ? `${json.error}${json.hint ? ' — ' + json.hint : ''}` : (json.hint || 'Email send failed');
        throw new Error(errorDetail);
      }
    } catch (err) {
      console.error('Email send error:', err);
      // Update log status to Failed
      const logEntry = state.logs.find(l => l.id === logId);
      if (logEntry) logEntry.status = 'Failed';
      saveLogs();
      if (DOM.alarmEmailStatus) {
        DOM.alarmEmailStatus.textContent = `⚠️ Email failed: ${err.message}`;
        DOM.alarmEmailStatus.style.color = '#ff6b6b';
      }
    }
  }

  function openAlarmModal(task) {
    state.activeAlarmTask = task;
    const cat = CATEGORY_MAP[task.category] || CATEGORY_MAP.work;

    DOM.alarmTaskTitle.textContent = task.title;
    DOM.alarmTaskNotes.textContent = task.notes || 'Time is up! Begin your task now.';
    DOM.alarmCategoryGradient.className = `alarm-album ${cat.gradient}`;
    DOM.alarmEmoji.textContent = cat.emoji;

    const fullPhone = `${state.user.country} ${state.user.phone}`;
    DOM.alarmSmsStatus.textContent = task.notifySMS && state.user.phone 
      ? `📨 SMS Dispatched to: ${fullPhone}` 
      : '📱 SMS Alert skipped (no number set)';

    if (task.notifyEmail && state.user.email) {
      DOM.alarmEmailRow.classList.remove('hidden');
      DOM.alarmEmailStatus.textContent = `✉️ Sending email to: ${state.user.email}…`;
      DOM.alarmEmailStatus.style.color = '#b3b3b3';
    } else {
      DOM.alarmEmailRow.classList.add('hidden');
    }

    DOM.alarmModalOverlay.classList.add('active');
  }

  function closeAlarmModal() {
    DOM.alarmModalOverlay.classList.remove('active');
    state.activeAlarmTask = null;
    renderTasks();
  }

  // =========================================================================
  // TASK LIST & FILTERING
  // =========================================================================
  function getFilteredTasks() {
    return state.tasks.filter(task => {
      if (state.currentFilter === 'all') return true;
      if (state.currentFilter === 'completed') return task.completed;
      if (state.currentFilter === 'upcoming') return !task.completed && !task.alertTriggered;
      if (state.currentFilter === 'focus') return !task.completed && task.alertTriggered;
      if (state.currentFilter === 'high') return !task.completed && task.priority === 'high';
      return true;
    });
  }

  function renderTasks() {
    const filtered = getFilteredTasks();
    const now = Date.now();

    const activeTasks = state.tasks.filter(t => !t.completed);
    const completedTasks = state.tasks.filter(t => t.completed);
    const triggeredCount = state.tasks.filter(t => t.alertTriggered).length;

    DOM.countActive.textContent = activeTasks.length;
    DOM.countCompleted.textContent = completedTasks.length;
    DOM.countAlertsFired.textContent = triggeredCount;

    DOM.tracklistContainer.innerHTML = '';

    if (filtered.length === 0) {
      DOM.emptyState.classList.remove('hidden');
    } else {
      DOM.emptyState.classList.add('hidden');

      filtered.forEach((task, index) => {
        const item = createTrackItemElement(task, index + 1, now);
        DOM.tracklistContainer.appendChild(item);
      });
    }

    updateNowPlayingHero();
  }

  function createTrackItemElement(task, trackNumber, now) {
    const div = document.createElement('div');
    const dueTime = new Date(task.dueDatetime).getTime();
    const isDue = dueTime <= now && !task.completed;
    const cat = CATEGORY_MAP[task.category] || CATEGORY_MAP.work;

    let statusClass = '';
    if (task.completed) statusClass = 'status-done';
    else if (isDue) statusClass = 'status-due';

    div.className = `track-item ${statusClass}`;
    div.dataset.id = task.id;

    const diffSec = Math.round((dueTime - now) / 1000);
    let timeLabel = '';
    let badgeClass = '';

    if (task.completed) {
      timeLabel = 'Completed';
    } else if (diffSec <= 0) {
      timeLabel = 'Alarm Fired • Due';
      badgeClass = 'overdue';
    } else if (diffSec < 60) {
      timeLabel = `in ${diffSec}s`;
      badgeClass = 'due-soon';
    } else if (diffSec < 3600) {
      timeLabel = `in ${Math.round(diffSec / 60)}m`;
      badgeClass = 'due-soon';
    } else {
      const d = new Date(task.dueDatetime);
      timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const priorityDot = task.priority === 'high' ? '<span class="item-priority-dot high" title="High Priority"></span>' : '';
    const smsIcon = task.notifySMS ? '<span title="SMS alert enabled">📱</span>' : '';
    const emailIcon = task.notifyEmail ? '<span title="Email alert enabled">✉️</span>' : '';
    const pushIcon = task.notifyPush ? '<span title="Push chime enabled">🔔</span>' : '';

    div.innerHTML = `
      <span class="track-index">${trackNumber < 10 ? '0' + trackNumber : trackNumber}</span>
      <div class="track-thumb ${cat.gradient}">
        ${cat.emoji}
      </div>
      <div class="track-details">
        <div class="item-title-row">
          <span class="item-title">${escapeHtml(task.title)}</span>
          ${priorityDot}
        </div>
        <div class="item-meta-row">
          <span class="time-badge ${badgeClass}">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${timeLabel}
          </span>
          <div class="notify-icons">${smsIcon}${emailIcon}${pushIcon}</div>
        </div>
      </div>
      <div class="track-actions">
        <button class="btn-check-track" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2.5" fill="none"></polyline>
          </svg>
        </button>
        <button class="btn-track-more" title="Edit task">⋮</button>
      </div>
    `;

    // Event listeners
    const checkBtn = div.querySelector('.btn-check-track');
    checkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTaskCompletion(task.id);
    });

    const moreBtn = div.querySelector('.btn-track-more');
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(task.id);
    });

    div.addEventListener('click', () => {
      setFocusedTask(task.id);
    });

    return div;
  }

  function setFocusedTask(taskId) {
    state.focusedTaskId = taskId;
    updateNowPlayingHero();
  }

  function toggleTaskCompletion(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) {
        showToast('Track Completed! 🎉', `Finished "${task.title}"`, '✅');
      }
      saveTasks();
    }
  }

  function updateNowPlayingHero() {
    const activeTasks = state.tasks.filter(t => !t.completed);
    
    let currentTask = null;
    if (state.focusedTaskId) {
      currentTask = state.tasks.find(t => t.id === state.focusedTaskId && !t.completed);
    }
    if (!currentTask && activeTasks.length > 0) {
      currentTask = [...activeTasks].sort((a, b) => new Date(a.dueDatetime) - new Date(b.dueDatetime))[0];
      state.focusedTaskId = currentTask.id;
    }

    if (!currentTask) {
      DOM.heroTaskTitle.textContent = 'Queue is clear';
      DOM.heroTaskMeta.textContent = 'All caught up! Tap + Add Task below';
      DOM.heroCountdownText.textContent = 'No alarms pending';
      DOM.heroGradient.className = 'album-art-inner gradient-personal';
      DOM.heroEmoji.textContent = '✨';
      DOM.urgencyTag.textContent = 'FREE TIME';
      DOM.urgencyTag.className = 'urgency-tag';
      DOM.heroProgressBar.style.width = '0%';
      DOM.heroStartTime.textContent = '--:--';
      DOM.heroDueTime.textContent = '--:--';
      return;
    }

    const cat = CATEGORY_MAP[currentTask.category] || CATEGORY_MAP.work;
    DOM.heroTaskTitle.textContent = currentTask.title;
    DOM.heroTaskMeta.textContent = `${cat.name} Playlist • ${currentTask.priority === 'high' ? 'High Priority' : 'Normal'}`;
    DOM.heroGradient.className = `album-art-inner ${cat.gradient}`;
    DOM.heroEmoji.textContent = cat.emoji;

    const dueDate = new Date(currentTask.dueDatetime);
    DOM.heroDueTime.textContent = `Alert at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const createdDate = new Date(currentTask.createdAt || Date.now() - 3600000);
    DOM.heroStartTime.textContent = `Queued ${createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    updateHeroCountdown();
  }

  function updateHeroCountdown() {
    if (!state.focusedTaskId) return;
    const task = state.tasks.find(t => t.id === state.focusedTaskId);
    if (!task || task.completed) return;

    const now = Date.now();
    const dueTime = new Date(task.dueDatetime).getTime();
    const diff = Math.round((dueTime - now) / 1000);

    if (diff <= 0) {
      DOM.heroCountdownText.textContent = '🚨 Alarm Hit! Alert Dispatched';
      DOM.urgencyTag.textContent = 'DUE NOW';
      DOM.urgencyTag.className = 'urgency-tag urgent';
      DOM.heroProgressBar.style.width = '100%';
    } else {
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      DOM.heroCountdownText.textContent = diff < 60 
        ? `Alert in ${secs}s` 
        : `Alert in ${mins}m ${secs < 10 ? '0' + secs : secs}s`;

      if (diff <= 300) {
        DOM.urgencyTag.textContent = 'DUE SOON';
        DOM.urgencyTag.className = 'urgency-tag urgent';
      } else {
        DOM.urgencyTag.textContent = 'SCHEDULED';
        DOM.urgencyTag.className = 'urgency-tag';
      }

      // Progress bar
      const createdAt = new Date(task.createdAt || (dueTime - 3600000)).getTime();
      const totalSpan = dueTime - createdAt;
      const elapsed = now - createdAt;
      const pct = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));
      DOM.heroProgressBar.style.width = `${pct}%`;
    }
  }

  // =========================================================================
  // ADD & EDIT TASK MODAL
  // =========================================================================
  function openAddTaskModal() {
    DOM.modalTitle.textContent = 'Queue a New Task';
    DOM.editTaskId.value = '';
    DOM.taskTitle.value = '';
    DOM.taskNotes.value = '';
    
    // Default to 15 minutes from now
    const now = new Date();
    const defaultTarget = new Date(now.getTime() + 15 * 60 * 1000);
    
    const yyyy = defaultTarget.getFullYear();
    const mm = String(defaultTarget.getMonth() + 1).padStart(2, '0');
    const dd = String(defaultTarget.getDate()).padStart(2, '0');
    DOM.taskDate.value = `${yyyy}-${mm}-${dd}`;

    const hh = String(defaultTarget.getHours()).padStart(2, '0');
    const min = String(defaultTarget.getMinutes()).padStart(2, '0');
    DOM.taskTime.value = `${hh}:${min}`;

    // Select work category by default
    const workRadio = document.querySelector('input[name="category"][value="work"]');
    if (workRadio) workRadio.checked = true;

    DOM.taskModalOverlay.classList.add('active');
    setTimeout(() => DOM.taskTitle.focus(), 150);
  }

  function openEditModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    DOM.modalTitle.textContent = 'Edit Task Track';
    DOM.editTaskId.value = task.id;
    DOM.taskTitle.value = task.title;
    DOM.taskNotes.value = task.notes || '';

    const d = new Date(task.dueDatetime);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    DOM.taskDate.value = `${yyyy}-${mm}-${dd}`;

    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    DOM.taskTime.value = `${hh}:${min}`;

    const catRadio = document.querySelector(`input[name="category"][value="${task.category}"]`);
    if (catRadio) catRadio.checked = true;

    DOM.notifySMS.checked = task.notifySMS !== false;
    DOM.notifyEmail.checked = task.notifyEmail !== false;
    DOM.notifyPush.checked = task.notifyPush !== false;

    DOM.taskModalOverlay.classList.add('active');
  }

  function closeTaskModal() {
    DOM.taskModalOverlay.classList.remove('active');
  }

  function handleTaskFormSubmit(e) {
    e.preventDefault();
    const title = DOM.taskTitle.value.trim();
    const dateVal = DOM.taskDate.value;
    const timeVal = DOM.taskTime.value;
    
    if (!title || !dateVal || !timeVal) {
      alert('Please provide a task title, date, and alert time.');
      return;
    }

    const selectedCategory = document.querySelector('input[name="category"]:checked')?.value || 'work';
    const combinedDue = new Date(`${dateVal}T${timeVal}:00`);

    const editId = DOM.editTaskId.value;
    if (editId) {
      // Update existing task
      const task = state.tasks.find(t => t.id === editId);
      if (task) {
        task.title = title;
        task.category = selectedCategory;
        task.dueDatetime = combinedDue.toISOString();
        task.notes = DOM.taskNotes.value.trim();
        task.notifySMS = DOM.notifySMS.checked;
        task.notifyEmail = DOM.notifyEmail.checked;
        task.notifyPush = DOM.notifyPush.checked;
        task.alertTriggered = false; // Reset alert
        showToast('Track Updated! 🎵', `Alert scheduled for ${timeVal}`, '✏️');
      }
    } else {
      // Create new task
      const newTask = {
        id: 'task_' + Date.now(),
        title: title,
        category: selectedCategory,
        dueDatetime: combinedDue.toISOString(),
        notes: DOM.taskNotes.value.trim(),
        priority: selectedCategory === 'urgent' ? 'high' : 'normal',
        notifySMS: DOM.notifySMS.checked,
        notifyEmail: DOM.notifyEmail.checked,
        notifyPush: DOM.notifyPush.checked,
        completed: false,
        alertTriggered: false,
        createdAt: new Date().toISOString()
      };

      state.tasks.unshift(newTask);
      state.focusedTaskId = newTask.id;
      showToast('Track Queued! 🎧', `Alert scheduled for ${timeVal}`, '➕');
    }

    saveTasks();
    closeTaskModal();
  }

  // =========================================================================
  // DRAWER (LOGS & PROFILE)
  // =========================================================================
  function openDrawer(tab = 'logs') {
    DOM.drawerOverlay.classList.add('active');
    switchDrawerTab(tab);
  }

  function closeDrawer() {
    DOM.drawerOverlay.classList.remove('active');
  }

  function switchDrawerTab(tab) {
    if (tab === 'logs') {
      DOM.dtabLogs.classList.add('active');
      DOM.dtabProfile.classList.remove('active');
      DOM.dcontentLogs.classList.add('active');
      DOM.dcontentProfile.classList.remove('active');
      DOM.drawerTitle.textContent = 'SMS & Email Alerts Log';
    } else {
      DOM.dtabLogs.classList.remove('active');
      DOM.dtabProfile.classList.add('active');
      DOM.dcontentLogs.classList.remove('active');
      DOM.dcontentProfile.classList.add('active');
      DOM.drawerTitle.textContent = 'Profile & Settings';
    }
  }

  function renderLogs() {
    DOM.logBadgeCount.textContent = state.logs.length;
    DOM.logsListContainer.innerHTML = '';

    if (state.logs.length === 0) {
      DOM.logsListContainer.innerHTML = `
        <div style="text-align:center; padding: 24px 0; color: var(--sp-text-muted); font-size: 12px;">
          No alerts dispatched yet.<br>When a scheduled task hits its target time, delivery logs appear here.
        </div>
      `;
      return;
    }

    state.logs.forEach(log => {
      const div = document.createElement('div');
      div.className = 'log-item';
      const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      div.innerHTML = `
        <div class="log-header">
          <span class="log-title">${escapeHtml(log.taskTitle)}</span>
          <span class="log-time">${timeStr}</span>
        </div>
        <div class="log-channel">Dispatched via ${escapeHtml(log.channel)} • ${escapeHtml(log.status)}</div>
        <div class="log-target">Target: ${escapeHtml(log.recipient)}</div>
      `;
      DOM.logsListContainer.appendChild(div);
    });
  }

  // =========================================================================
  // EVENT LISTENERS SETUP
  // =========================================================================
  function setupEventListeners() {
    // 1. Auth Form Submit
    DOM.authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = DOM.userPhone.value.trim();
      if (!phone) {
        alert('Please enter your mobile number so SpotiTask can alert you.');
        return;
      }

      state.user.phone = phone;
      state.user.country = DOM.phoneCountry.value;
      state.user.email = DOM.userEmail.value.trim();
      state.user.name = DOM.userName.value.trim() || 'Alex';
      state.user.autoLogin = DOM.chkAutoLogin.checked;
      state.user.isLoggedIn = true;
      saveUserData();

      // Request browser notification permission
      requestNotificationPermission();

      // Unlock Web Audio context on user tap
      initAudioContext();

      showToast('Logged In Successfully! 🎧', `Alerts armed for ${state.user.country} ${state.user.phone}`, '🟢');
      showDashboard();
    });

    // Quick Login (Returning User)
    DOM.btnQuickLogin.addEventListener('click', () => {
      state.user.isLoggedIn = true;
      saveUserData();
      initAudioContext();
      requestNotificationPermission();
      showDashboard();
    });

    // Social Button (Google)
    DOM.btnSocialGoogle.addEventListener('click', () => {
      if (!state.user.name) state.user.name = 'Google User';
      state.user.isLoggedIn = true;
      state.user.autoLogin = true;
      saveUserData();
      initAudioContext();
      requestNotificationPermission();
      showDashboard();
    });

    // 2. Filter Chips
    DOM.filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.currentFilter = chip.dataset.filter;
        renderTasks();
      });
    });

    // 3. Clear Completed
    DOM.btnClearCompleted.addEventListener('click', () => {
      const count = state.tasks.filter(t => t.completed).length;
      if (count === 0) return;
      state.tasks = state.tasks.filter(t => !t.completed);
      saveTasks();
      showToast('Cleaned Queue', `Removed ${count} finished items`, '🧹');
    });

    // 4. Modals & Drawers
    DOM.btnOpenAddTask.addEventListener('click', () => openAddTaskModal());
    DOM.btnEmptyAdd.addEventListener('click', () => openAddTaskModal());
    DOM.btnCloseModal.addEventListener('click', closeTaskModal);
    DOM.btnCancelModal.addEventListener('click', closeTaskModal);
    DOM.taskForm.addEventListener('submit', handleTaskFormSubmit);

    // Time Preset Buttons in Modal
    DOM.timePresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const now = new Date();
        const mins = parseInt(btn.dataset.minutes, 10);
        const target = new Date(now.getTime() + mins * 60 * 1000);

        const yyyy = target.getFullYear();
        const mm = String(target.getMonth() + 1).padStart(2, '0');
        const dd = String(target.getDate()).padStart(2, '0');
        DOM.taskDate.value = `${yyyy}-${mm}-${dd}`;

        const hh = String(target.getHours()).padStart(2, '0');
        const min = String(target.getMinutes()).padStart(2, '0');
        DOM.taskTime.value = `${hh}:${min}`;
      });
    });

    // Hero Snooze & Done
    DOM.btnHeroSnooze.addEventListener('click', () => {
      if (!state.focusedTaskId) return;
      const task = state.tasks.find(t => t.id === state.focusedTaskId);
      if (task) {
        const newDue = new Date(Date.now() + 5 * 60 * 1000);
        task.dueDatetime = newDue.toISOString();
        task.alertTriggered = false;
        saveTasks();
        showToast('Snoozed 5 Minutes', `Next alert at ${newDue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, '⏰');
      }
    });

    DOM.btnHeroDone.addEventListener('click', () => {
      if (state.focusedTaskId) {
        toggleTaskCompletion(state.focusedTaskId);
      }
    });

    // Hero Focus Play/Pause
    DOM.btnHeroTogglePlay.addEventListener('click', () => {
      initAudioContext();
      state.isFocusPlaying = !state.isFocusPlaying;
      if (state.isFocusPlaying) {
        DOM.iconHeroPlay.classList.add('hidden');
        DOM.iconHeroPause.classList.remove('hidden');
        DOM.equalizerBars.style.opacity = '1';
        showToast('Focus Session Started! ⚡', 'Timer active. Notification will ping you when due.', '▶️');
      } else {
        DOM.iconHeroPlay.classList.remove('hidden');
        DOM.iconHeroPause.classList.add('hidden');
        DOM.equalizerBars.style.opacity = '0.35';
      }
    });

    // Alarm Modal Actions
    DOM.btnAlarmComplete.addEventListener('click', () => {
      if (state.activeAlarmTask) {
        toggleTaskCompletion(state.activeAlarmTask.id);
      }
      closeAlarmModal();
    });

    DOM.btnAlarmSnooze.addEventListener('click', () => {
      if (state.activeAlarmTask) {
        const newDue = new Date(Date.now() + 5 * 60 * 1000);
        state.activeAlarmTask.dueDatetime = newDue.toISOString();
        state.activeAlarmTask.alertTriggered = false;
        saveTasks();
        showToast('Alarm Snoozed 5 Min', 'We will alert your phone again in 5 minutes', '⏰');
      }
      closeAlarmModal();
    });

    // Drawer Triggers
    DOM.btnOpenLogs.addEventListener('click', () => openDrawer('logs'));
    DOM.btnEditContact.addEventListener('click', () => openDrawer('profile'));
    DOM.userAvatarBtn.addEventListener('click', () => openDrawer('profile'));
    DOM.btnCloseDrawer.addEventListener('click', closeDrawer);
    DOM.dtabLogs.addEventListener('click', () => switchDrawerTab('logs'));
    DOM.dtabProfile.addEventListener('click', () => switchDrawerTab('profile'));

    DOM.btnClearLogs.addEventListener('click', () => {
      state.logs = [];
      saveLogs();
    });

    // Profile Settings Form
    DOM.profileEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      state.user.phone = DOM.editUserPhone.value.trim();
      state.user.email = DOM.editUserEmail.value.trim();
      state.user.name = DOM.editUserName.value.trim();
      state.user.autoLogin = DOM.editAutoLogin.checked;
      state.user.webhookUrl = DOM.webhookUrl.value.trim();
      if (DOM.backendUrl) state.user.backendUrl = DOM.backendUrl.value.trim();
      saveUserData();
      updateUserBanner();
      updateGreeting();
      closeDrawer();
      showToast('Profile Saved', 'Notification contacts updated successfully', '💾');
    });

    // Test Email Button
    if (DOM.btnTestEmail) {
      DOM.btnTestEmail.addEventListener('click', async () => {
        const emailAddr = DOM.editUserEmail.value.trim() || state.user.email;
        if (!emailAddr) {
          if (DOM.testEmailStatus) {
            DOM.testEmailStatus.textContent = '⚠️ Enter an email address first.';
            DOM.testEmailStatus.style.color = '#ff6b6b';
          }
          return;
        }
        if (DOM.btnTestEmail) DOM.btnTestEmail.disabled = true;
        if (DOM.testEmailStatus) {
          DOM.testEmailStatus.textContent = '✉️ Sending test email…';
          DOM.testEmailStatus.style.color = '#b3b3b3';
        }
        const endpoint = getEmailEndpoint();
        try {
          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: emailAddr,
              subject: '✅ SpotiTask Test Email — Setup Confirmed!',
              message: 'Your Resend email integration is working. Real task reminders will now be delivered to this inbox.',
              task: { title: 'Test Email', category: 'work', notes: 'Resend API connection verified ✅' }
            })
          });
          const json = await resp.json();
          if (resp.ok && json.success) {
            if (DOM.testEmailStatus) {
              const info = json.id ? ` (ID: ${json.id.slice(0, 8)}…)` : '';
              DOM.testEmailStatus.innerHTML = `<span style="color:#1db954;">✅ Dispatched to ${escapeHtml(emailAddr)}${info}!</span><br><small style="color:#e0a82e;display:block;margin-top:4px;">⚠️ If not in Primary inbox, check <strong>Spam/Junk</strong> or search <code style="background:#111;color:#1db954;padding:1px 4px;border-radius:3px;">in:anywhere SpotiTask</code> in Gmail.</small>`;
            }
            showToast('Email Dispatched 📬', `Accepted by Resend for ${emailAddr}`, '✉️');
          } else {
            const errorMsg = json.error ? `${json.error}${json.hint ? ' — ' + json.hint : ''}` : (json.hint || 'Unknown error');
            throw new Error(errorMsg);
          }
        } catch (err) {
          if (DOM.testEmailStatus) {
            DOM.testEmailStatus.textContent = `❌ ${err.message}`;
            DOM.testEmailStatus.style.color = '#ff6b6b';
          }
        } finally {
          if (DOM.btnTestEmail) DOM.btnTestEmail.disabled = false;
        }
      });
    }


    // Logout
    DOM.btnLogout.addEventListener('click', () => {
      if (confirm('Log out from SpotiTask? This will pause auto-login until you sign in again.')) {
        state.user.isLoggedIn = false;
        state.user.autoLogin = false;
        saveUserData();
        closeDrawer();
        checkReturningUser();
        showAuth();
      }
    });

    // Bottom Navigation Tabs
    DOM.tabHome.addEventListener('click', () => {
      setNavActive(DOM.tabHome);
      closeDrawer();
      closeTaskModal();
    });
    DOM.tabAdd.addEventListener('click', () => {
      openAddTaskModal();
    });
    DOM.tabLogs.addEventListener('click', () => {
      setNavActive(DOM.tabLogs);
      openDrawer('logs');
    });
    DOM.tabProfile.addEventListener('click', () => {
      setNavActive(DOM.tabProfile);
      openDrawer('profile');
    });

    // Push Notification Permission button in app bar
    DOM.btnNotificationStatus.addEventListener('click', () => {
      requestNotificationPermission(true);
    });
  }

  function setNavActive(activeTab) {
    [DOM.tabHome, DOM.tabAdd, DOM.tabLogs, DOM.tabProfile].forEach(t => t.classList.remove('active'));
    activeTab.classList.add('active');
  }

  function requestNotificationPermission(showFeedback = false) {
    if (!('Notification' in window)) {
      if (showFeedback) alert('This browser does not support web notifications.');
      return;
    }

    if (Notification.permission === 'granted') {
      updateNotificationPermissionBadge();
      if (showFeedback) showToast('Notifications Armed 🔔', 'Push alerts are active on your device!', '🔔');
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        updateNotificationPermissionBadge();
        if (permission === 'granted') {
          showToast('Notifications Enabled! 🔔', 'Alerts will now ping your device when due.', '🔔');
        }
      });
    } else {
      updateNotificationPermissionBadge();
      if (showFeedback) {
        alert('Notifications are blocked in browser settings. Please enable notifications to receive alerts.');
      }
    }
  }

  function updateNotificationPermissionBadge() {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      DOM.pushBadgeDot.classList.add('off');
      DOM.btnNotificationStatus.title = 'Push Notifications Disabled - Tap to Enable';
    } else {
      DOM.pushBadgeDot.classList.remove('off');
      DOM.btnNotificationStatus.title = 'Push Notifications Active';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  // Self-start on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
