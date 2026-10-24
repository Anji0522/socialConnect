# SocialConnect 🌐

> An Instagram-style modern social networking web application built with the MERN stack (MongoDB, Express.js, React 19, Node.js), Socket.io, and Tailwind CSS.

[![CI Pipeline](https://github.com/Anji0522/socialConnect/actions/workflows/ci.yml/badge.svg)](https://github.com/Anji0522/socialConnect/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/Anji0522/socialConnect/actions/workflows/deploy.yml/badge.svg)](https://github.com/Anji0522/socialConnect/actions/workflows/deploy.yml)
[![Live Frontend Demo](https://img.shields.io/badge/Live_Frontend-Online-emerald?style=for-the-badge&logo=vercel)](https://anji0522.github.io/socialConnect/)
[![Backend API](https://img.shields.io/badge/Backend_API-Render_Ready-blue?style=for-the-badge&logo=render)](https://socialconnect-api.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🚀 Live Demo & Deployed Links

- **Frontend Web App (GitHub Pages)**: [https://anji0522.github.io/socialConnect/](https://anji0522.github.io/socialConnect/)
- **Production Backend API (Render)**: [https://socialconnect-api.onrender.com](https://socialconnect-api.onrender.com)
- **GitHub Repository**: [https://github.com/Anji0522/socialConnect](https://github.com/Anji0522/socialConnect)

> **Demo Sandbox Account**:
> - Email: `demo@socialconnect.dev`
> - Password: `Password123!` *(Pre-seeded sandbox demo credentials for instant evaluation)*
> - Or register a brand new account with your profile name, gender, and date of birth.

---

## 📸 Screenshots & UI Preview

| Home Feed & 3-Column Layout | Explore 3x3 Photo Grid |
| :---: | :---: |
| ![Home Feed](docs/screenshots/feed.png) | ![Explore Grid](docs/screenshots/explore.png) |

| Real-Time Direct Messaging (Socket.io) | 24-Hour Stories Viewer |
| :---: | :---: |
| ![Direct Messages](docs/screenshots/chat.png) | ![Stories Viewer](docs/screenshots/stories.png) |

---

## ✨ Features

- 📸 **Posts & Media Composer**
  - Multi-image and video upload with removable thumbnail previews.
  - Client-side HTML5 Canvas image compression before upload.
  - Location tagging (`MapPin`) and clickable `#hashtags` & `@mentions`.
  - Edit and delete own posts.
- 📱 **Instagram-style Feed & Explore**
  - Following feed (newest first) and "Popular" feed ranking tabs.
  - Infinite scroll with cursor-based pagination.
  - 3-column square photo Explore grid with search by keyword, hashtag, or creator.
- ❤️ **Interactions, Comments & Saves**
  - Double-tap on media for Instagram-style heart pop animation.
  - Bookmark / save posts with a dedicated "Saved Posts" tab and page (`/saved`).
  - Nested comment threads (replies), comment likes, and inline comment editing.
  - 1-click post link sharing with copy-to-clipboard toast.
- 💬 **Real-Time Direct Messaging (Socket.io)**
  - One-to-one instant messaging.
  - Online presence green indicator dots.
  - Live typing indicator (`User is typing...`).
  - Read receipts (`Seen` / checkmarks).
  - Photo/image sharing in direct chat.
- ⏱️ **Stories (24-Hour Disappearing)**
  - Ephemeral photo and video stories bar with unread gradient rings.
  - Auto-advancing fullscreen viewer with tap-to-navigate.
  - Viewer list for the story owner.
  - Quick emoji reaction bar (🔥, ❤️, 😂, 😮, 😢, 👏) and reply to DM.
  - MongoDB TTL index for automatic 24-hour expiration.
- 🛡️ **Safety & Moderation**
  - Block and unblock users (blocked users are automatically hidden from feed, search, and messages).
  - Mute and unmute users.
  - Report posts and user profiles for moderation review.
  - Private accounts with follow requests (accept/decline flow).
- 🔍 **Search & Discovery**
  - Debounced search for users and hashtags.
  - Recent searches history saved locally.
  - Trending hashtags section with post counts.
- 🔒 **Security & Production Hardening**
  - Helmet HTTP security headers.
  - Rate limiting on authentication and API endpoints.
  - Strict CORS whitelist.
  - NoSQL injection sanitization and basic XSS hygiene.
  - httpOnly, secure, SameSite JWT access and refresh token rotation.
  - Token-based email verification and password reset flows (Nodemailer).
- 🌓 **Theme & Progressive Web App (PWA)**
  - Light and Dark mode with persistent theme preference.
  - Fully mobile-responsive layout with bottom navigation on small screens.
  - Service worker caching shell and PWA web manifest.
  - Global Error Boundary and floating Toast notification system.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React icons, React Router DOM v7 |
| **Real-time** | Socket.io & Socket.io Client |
| **Backend** | Node.js, Express.js (pure JavaScript MERN stack) |
| **Database** | MongoDB with Mongoose ODM (with compound & TTL indexes) |
| **Authentication** | JWT (httpOnly cookies & Bearer tokens), bcryptjs password hashing |
| **Security** | Helmet, express-rate-limit, custom NoSQL injection sanitization, CORS whitelist |
| **Emails** | Nodemailer (with dev/test fallback logging) |
| **Media Storage**| Cloudinary (with local disk fallback) |
| **CI / CD** | GitHub Actions (`ci.yml` & `deploy.yml`) |

---

## 📁 Project Structure

```text
socialConnect/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Automated Lint, Test & Build CI pipeline
│       └── deploy.yml          # GitHub Pages automated deployment
├── client/                     # React 19 + Vite Frontend
│   ├── public/
│   │   ├── 404.html            # SPA redirect for GitHub Pages
│   │   ├── manifest.json       # PWA web manifest
│   │   └── sw.js               # Service Worker
│   ├── src/
│   │   ├── components/         # Reusable UI (PostCard, CommentThread, MediaGrid, Stories, etc.)
│   │   ├── context/            # AuthContext, SocketContext, ToastContext
│   │   ├── layouts/            # AppLayout (3-column responsive layout)
│   │   ├── lib/                # api.js, mockBackend.js, imageCompression.js
│   │   └── pages/              # HomePage, ExplorePage, MessagesPage, ProfilePage, SavedPage, etc.
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # env.js, db.js
│   │   ├── controllers/        # auth, user, post, engagement, message, story, upload
│   │   ├── middleware/         # auth, validate, sanitize, csrf, errorHandler
│   │   ├── models/             # User, Post, Comment, Like, Follow, Story, Message, Conversation, Report
│   │   ├── tests/              # Automated node:test suites (auth, social, chat_block)
│   │   ├── socket.js           # Socket.io real-time server
│   │   └── app.js              # Express app
│   └── package.json
├── render.yaml                 # Render backend deployment blueprint
├── vercel.json                 # Vercel deployment configuration
├── .env.example                # Full environment template
├── CONTRIBUTING.md             # Contribution guidelines
├── LICENSE                     # MIT License
├── package.json                # Root workspace configuration
└── README.md
```

---

## ⚙️ Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Anji0522/socialConnect.git
cd socialConnect
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment configuration
```bash
cp .env.example server/.env
```
*(The default values in `.env.example` allow immediate local execution with local MongoDB or memory server)*

### 4. Run the development server
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Socket.io**: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Testing & Quality Checks

Run all automated test suites:
```bash
npm test -w server
```

Run ESLint:
```bash
npm run lint -w client
```

Build production bundle:
```bash
npm run build -w client
```

---

## 🗺️ Roadmap

- [x] **Phase 1: Fix & Harden**: SPA routing, Helmet, rate-limiting, NoSQL sanitization, httpOnly refresh tokens, password reset.
- [x] **Phase 2: Missing Features**: Socket.io 1-to-1 chat, story viewer list & emoji reactions, user blocking/muting, debounced search, private account follow requests.
- [x] **Phase 3: Production Backend**: Cloudinary upload pipeline, MongoDB compound/TTL indexes, Render deployment config (`render.yaml`).
- [x] **Phase 4: Quality & UX**: Error boundaries, Toast provider, PWA manifest & service worker, chat & block automated test suites, GitHub Actions CI workflow.
- [ ] **Phase 5 (Next)**: Group video calling (WebRTC) and audio voice messages in Direct Messages.

---

## 👨‍💻 Author

**Anjaiah Siddam**
- GitHub: [@Anji0522](https://github.com/Anji0522)
- Project Repository: [https://github.com/Anji0522/socialConnect](https://github.com/Anji0522/socialConnect)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
