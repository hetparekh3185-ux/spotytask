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

## 📧 Email Notice for Free Tier Resend Users
When sending from the default testing sender (`onboarding@resend.dev`), Resend requires the destination email to be your verified Resend account email address (`hetparekh3185@gmail.com`). Check your **Spam / Junk** folder if testing emails don't appear in your Primary tab.

To send reminders to any recipient address, verify a custom domain at [resend.com/domains](https://resend.com/domains).
