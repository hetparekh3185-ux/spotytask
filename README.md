# 🎵 SpotiTask

> Spotify-themed personal task manager with real email reminders powered by the Resend API.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://spotytask.vercel.app)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black.svg)](https://spotytask.vercel.app)
[![Resend](https://img.shields.io/badge/email-Resend%20API-000000.svg)](https://resend.com)

---

## ✨ Features

- 🎧 **Spotify Dark-Mode Aesthetic**: Custom playlist-style task management, sleek green accents, animations, and micro-interactions.
- ✉️ **Real Email Reminders**: Instant delivery of Spotify-themed HTML task alerts directly to your inbox via Resend API.
- 🔔 **Web Notifications & Audio Chimes**: Web Audio synthesizer alert chimes and native system push notifications.
- 📱 **Mobile & PWA Ready**: Installable Progressive Web App with service worker caching and Android vibration support.
- ⚙️ **Settings & Diagnostics**: Built-in test email tool with real-time status reporting and live alert dispatch logs.

---

## 🚀 Live App

- **Production URL**: [https://spotytask.vercel.app](https://spotytask.vercel.app)

---

## 🛠️ Quickstart (Local Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hetparekh3185-ux/spotytask.git
   cd spotytask
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   PORT=3000
   ```

4. **Start the local server**:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

---

## ☁️ Deployment (Vercel)

SpotiTask is designed to deploy seamlessly to Vercel without requiring external server hosting.
1. Add `RESEND_API_KEY` to Vercel Environment Variables.
2. Deploy via `npx vercel --prod`.

---

## 📧 Email Options & Setup

SpotiTask supports two ways to deliver task reminders:

### Option 1: Direct Gmail SMTP (Recommended)
Deliver real emails from `spotytask@gmail.com` to any recipient without domain restrictions:
1. Enable 2-Step Verification on your `spotytask@gmail.com` Google Account.
2. Generate an **App Password** at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. In your `.env` file, add:
   ```env
   GMAIL_USER=spotytask@gmail.com
   GMAIL_APP_PASSWORD=your_16_character_app_password
   ```

### Option 2: Resend API
1. On the free tier default sender (`onboarding@resend.dev`), Resend requires the destination email to be your verified Resend account email address (`spotytask@gmail.com`). Check your **Spam / Junk** folder if testing emails don't appear in your Primary tab.
2. To send reminders to any recipient address via Resend, verify a custom domain at [resend.com/domains](https://resend.com/domains).

---

## ⏰ Independent Server-Side Scheduler (`node-cron`)

SpotiTask automatically syncs your queued tasks with the server-side task store (`data/tasks.json`). An internal `node-cron` scheduler runs continuously every minute:
- Evaluates pending tasks against their due timestamp.
- Dispatches Spotify-themed HTML alerts directly to your inbox when a task is due.
- Automatically marks tasks as notified so alerts are never sent twice.
- **Runs independently of whether your browser tab is open, minimized, or closed.**

### 🛑 Keeping Render (Free Tier) Awake 24/7

Free web services on Render spin down into sleep mode after ~15 minutes of inactivity. When asleep, background timers stop running until traffic arrives.

To keep your server active 24/7 without paying:
1. **Sign up for free at [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com).**
2. Create a new monitor / cron job with the URL:
   ```text
   https://<your-render-app>.onrender.com/ping
   ```
   *(or `https://<your-render-app>.onrender.com/api/cron-check` to simultaneously trigger an immediate check)*
3. Set the interval to **every 10 minutes** (or 5 minutes).
4. Save the monitor. This ping keeps your Render container awake indefinitely, ensuring `node-cron` fires your task reminder emails reliably on time!

### 🔌 Background API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/ping` | `GET` | Lightweight keep-alive for UptimeRobot / cron-job.org |
| `/api/health` | `GET` | Returns server uptime, task count, and status |
| `/api/tasks/sync` | `POST` | Bidirectional task synchronization between frontend & server |
| `/api/cron-check` | `GET` / `POST` | Evaluates due tasks and dispatches reminder emails on demand |
| `/api/send-email` | `POST` | Dispatches single email via Gmail SMTP or Resend API |


