# SocialConnect 🌐

> An Instagram-style modern social networking web application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Tailwind CSS.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-emerald?style=for-the-badge&logo=vercel)](https://anji0522.github.io/socialConnect/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/Anji0522/socialConnect)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🚀 Live Demo

Experience the live app here:
👉 **[https://anji0522.github.io/socialConnect/](https://anji0522.github.io/socialConnect/)**

*(You can sign up for a new account with your profile name, gender, and date of birth, or log in with the pre-seeded demo user `demo@socialconnect.dev` / `Password123!`)*

---

## 📸 Screenshots & UI Preview

```
+---------------------------------------------------------------------------------------------------+
|  [Logo] SocialConnect                     [ Search #hashtags, @users ]              [Avatar] [Theme] |
+-------------------------------+-----------------------------------------+-------------------------+
|  LEFT SIDEBAR                 |  CENTER FEED                            |  RIGHT SIDEBAR          |
|  - Feed                       |  +-----------------------------------+  |  - Follow Requests      |
|  - Explore                    |  | Stories Bar (24h Disappearing)    |  |    [Accept] [Decline]   |
|  - Messages                   |  +-----------------------------------+  |                         |
|  - Notifications              |  | Post Composer (Media/Tags/Location)  |  - Suggestions for you  |
|  - Saved                      |  +-----------------------------------+  |    [Follow]             |
|  - Profile                    |  | Post Cards (Double-tap ❤️, nested  |  |                         |
|  - Settings                   |  | comments, photo grid, saves)       |  |  - Activity / Trends    |
|                               |  +-----------------------------------+  |                         |
|  Contacts (Online Presence)   |  Infinite Scroll Feed                   |  (c) 2026 SocialConnect |
+-------------------------------+-----------------------------------------+-------------------------+
```

---

## ✨ Features

- 📸 **Posts & Media Composer**
  - Multi-image and video uploads with interactive carousel / grid layout.
  - Client-side Canvas image compression before upload.
  - Location tagging (`MapPin`) and clickable `#hashtags` & `@mentions`.
  - Edit and delete own posts.
- 📱 **Instagram-style Feed & Explore**
  - Following feed (newest first) and "Popular" feed ranking tabs.
  - Infinite scroll with cursor-based pagination.
  - 3-column photo Explore grid with search by keyword, hashtag, or creator.
- ❤️ **Engagement & Interactions**
  - Double-tap on media for Instagram-style heart pop animation.
  - Bookmark / save posts with a dedicated "Saved Posts" tab and page (`/saved`).
  - Nested comment threads (replies), comment likes, and inline comment editing.
  - 1-click post link sharing with copy-to-clipboard toast.
- 👥 **User Profiles & Personal Details**
  - User profile customization: profile name, username, bio, location, website URL, gender, and date of birth (`dob`).
  - Follow / unfollow with real-time follower & following counts and lists.
  - Private accounts toggle (only approved followers can see posts).
  - Profile tabs: **Posts** (Card view vs. 3x3 Photo Grid) and **Saved**.
- ⏱️ **Stories (24h Expiry)**
  - Ephemeral photo and video stories bar with unread gradient rings.
  - Fullscreen story viewer with auto-advancing progress bar.
- 💬 **Direct Messages & Contacts (Real-time)**
  - Active contact list with online/offline presence indicators.
- 🔔 **Notifications System**
  - Activity feed for likes, comments, follows, and mentions with unread status badges.
- 🌓 **Design & Theme**
  - Modern 3-column layout built with Tailwind CSS.
  - Light and Dark mode toggle with persistent theme preference.
  - Fully mobile-responsive layout with bottom navigation on small screens.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React icons, React Router DOM |
| **Backend** | Node.js, Express.js (pure JavaScript MERN stack) |
| **Database** | MongoDB with Mongoose ODM (or standalone in-memory / client storage) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing, secure cookies |
| **Validation** | Zod input schema validation on all API endpoints |
| **Deployment** | GitHub Pages (CI/CD via GitHub Actions) & Vercel / Netlify / Render ready |

---

## 📁 Project Structure

```text
socialConnect/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD workflow
├── client/                     # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI (PostCard, CommentThread, MediaGrid, etc.)
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── layouts/            # AppLayout (3-column responsive layout)
│   │   ├── lib/                # api.js, mockBackend.js, imageCompression.js
│   │   └── pages/              # HomePage, ExplorePage, SavedPage, ProfilePage, etc.
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/        # auth, post, engagement, user controllers
│   │   ├── middleware/         # auth, validate, upload, error middleware
│   │   ├── models/             # User, Post, Comment, Follow, Story, Notification
│   │   ├── tests/              # Automated node:test suites (auth & social)
│   │   └── app.js              # Express app entry
│   └── package.json
├── vercel.json                 # Vercel deployment configuration
├── .env.example                # Backend environment template
├── client/.env.example         # Frontend environment template
├── package.json                # Root workspace configuration
└── README.md
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- Node.js (v18 or v20+)
- npm (v9+)
- MongoDB (local instance or MongoDB Atlas URI)

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
Create `server/.env` based on `.env.example`:
```bash
cp .env.example server/.env
```
Example `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/socialconnect
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=super-secret-jwt-key-replace-in-production
JWT_EXPIRES_IN=7d
```

### 4. Run the application
Run both server and client concurrently from the project root:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Testing & Linting

Run automated backend test suites (uses in-memory MongoDB):
```bash
npm test -w server
```

Run ESLint verification:
```bash
npm run lint -w client
```

Build production bundle:
```bash
npm run build -w client
```

---

## 🌐 Deployment Instructions

### Option 1: GitHub Pages (Currently Active)
This repository includes a GitHub Actions workflow in `.github/workflows/deploy.yml` that automatically builds and deploys the frontend to GitHub Pages on every push to `main`.
1. Go to repository **Settings > Pages**.
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. Live URL: `https://anji0522.github.io/socialConnect/`

### Option 2: Vercel (Frontend)
1. Import this repository into [Vercel](https://vercel.com).
2. Root directory: leave as `./` (the included `vercel.json` automatically configures the Vite build).
3. (Optional) Set `VITE_API_URL` environment variable if connecting to an external Express backend.
4. Click **Deploy**.

### Option 3: Render / Railway (Backend)
1. Deploy the `server` directory as a Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Set build command: `npm install` and start command: `npm start -w server`.
3. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`.

---

## 👨‍💻 Author

**Anjaiah Siddam**
- GitHub: [@Anji0522](https://github.com/Anji0522)
- Project Repository: [https://github.com/Anji0522/socialConnect](https://github.com/Anji0522/socialConnect)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
