# 🌐 SocialConnect

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-68a063.svg?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000.svg?logo=express)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248.svg?logo=mongodb)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38b2ac.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Deploy Status](https://img.shields.io/badge/Deploy-GitHub_Pages-22c55e.svg)](https://anji0522.github.io/socialConnect/)

> **SocialConnect** is a modern, responsive full-stack social networking application built from the ground up with the **MERN stack** (MongoDB, Express, React, Node.js) in 100% pure JavaScript. It features a sleek 3-column dashboard, cursor-paginated infinite feeds, multi-image collage composer, optimistic engagement, interactive stories, and graph-based follow suggestions.

---

## 🚀 Live Demo & Deployment

- 🌐 **Live Web Application**: [https://anji0522.github.io/socialConnect/](https://anji0522.github.io/socialConnect/)
- 📦 **GitHub Repository**: [https://github.com/Anji0522/socialConnect](https://github.com/Anji0522/socialConnect)

**Pre-seeded Demo Account:**
- **Email:** `demo@socialconnect.dev`
- **Password:** `Password123!`

---

## 🎯 The Problem SocialConnect Solves

### The Challenge
Modern social networking platforms often suffer from:
1. **Bloated & Unintuitive Interfaces**: Cluttered navigation that overwhelms users with advertisements, algorithmic noise, and buried core features.
2. **Sluggish Feeds & Page Freezes**: Naive offset pagination (`skip() / limit()`) leads to high latency and database CPU spikes as feeds grow, causing duplicate or skipped posts.
3. **Severe N+1 Query Bottlenecks**: Loading user data, like statuses, and comment counts individually per post degrades API response times.
4. **Poor Mobile Adaptability**: Clunky responsive designs where desktop sidebars fail to collapse cleanly or consume excessive vertical screen real estate.
5. **Rigid Theme Support**: Broken dark modes with poor color contrast and harsh transitions.

### The Solution: SocialConnect
SocialConnect solves these architectural challenges by providing:
- **Clean 3-Column Dashboard**: Left navigation & contacts, center composer & feed, right suggestions & live activity. Collapses gracefully into a native-like mobile app experience with bottom navigation.
- **True Cursor-Based Pagination**: Stable, zero-drift infinite scrolling based on `{ createdAt, _id }` compound indexes, preventing skipped posts even while new content is being published simultaneously.
- **Zero N+1 Query Aggregation**: The feed pipeline batches like counts, comment counts, follow relations, and viewer like states into single vectorized queries.
- **Graph-Based Social Suggestions**: A 2nd-degree mutuals algorithm that discovers people followed by the users you already follow.
- **Fluid Optimistic Interactions**: Immediate UI feedback on likes, follows, and comments with automatic rollback on network failure.
- **Accessible Dual Themes**: Full Light and Dark themes engineered with CSS HSL variables and automatic `localStorage` persistence.

---

## ✨ Key Highlights & Features

### 1. 3-Column Layout Dashboard (`AppLayout`)
- **Left Column**:
  - App brand logo and navigation (Feed, Explore, Messages, Notifications, Saved, Profile, Settings).
  - Current-user mini-profile card with live posts, followers, and following counters.
  - Interactive **Contacts list** with active online presence indicators (green dot) and quick-chat icons.
  - Light/Dark mode toggle and one-click Logout.
- **Center Column**:
  - Horizontal **Stories Bar** with gradient seen/unseen rings and full-screen timed story viewer.
  - **Post Composer** with hashtag parsing, photo picker, image preview strip, and removal controls.
  - Feed filter tabs: **Latest** (chronological) and **Popular** (weighted engagement algorithm with time decay).
  - Cursor-based infinite scrolling feed with loading skeletons and empty states.
- **Right Column**:
  - **Follow Requests** widget with instant Accept / Decline actions.
  - **Suggestions For You** widget featuring mutual-connection discovery and instant Follow buttons.
  - **Live Activity** notification feed showing real-time likes, comments, and follows.
  - Quick footer links.
- **Mobile Experience**:
  - Automatic sidebar collapse with a fixed, thumb-friendly bottom navigation bar.

### 2. Rich Post Composer & MediaGrid
- Share text with automatic `#hashtag` extraction and indexing.
- Multi-image uploads supporting up to **10 images** per post.
- Dynamic **MediaGrid**:
  - 1 image: Full hero presentation.
  - 2 images: 50/50 dual column.
  - 3 images: 1 tall showcase + 2 stacked tiles.
  - 4 images: 2x2 symmetrical grid.
  - 5+ images: 5-tile collage with an overlaid `+N` badge indicating remaining images.
- "Read more" / "Show less" text truncation for posts exceeding 180 characters.
- In-place post editing and post deletion with confirmation.

### 3. Social Interaction & Profiles
- **Follow System**: Follow and unfollow users with immediate counter synchronization. Dedicated `/followers` and `/following` list pages.
- **Optimistic Likes**: Instant heart icon animations and counter updates with network rollback protection.
- **Comment Threads**: Inline comment viewer with timestamps, author avatars, "Show more comments" pagination, and deletion of own comments.
- **Comprehensive Profiles**: Customizable banners/cover images, profile avatars, user bios, location tags, activity counts, and tabs for user posts.
- **Profile Settings**: Update name, bio, location, and upload avatar/cover photos.

---

## 🛠️ Complete Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utility**: `clsx`, `tailwind-merge`

### Backend API
- **Runtime**: [Node.js](https://nodejs.org/) (v20+ ES Modules)
- **Framework**: [Express 5](https://expressjs.com/)
- **Validation**: [Zod](https://zod.dev/) input validation schemas on all endpoints
- **Authentication**: `bcryptjs` (salt rounds: 12) + `jsonwebtoken` in secure `httpOnly` cookies
- **Security**: `helmet`, `cors`, custom CSRF origin validation, rate-limiting on authentication routes
- **File Uploads**: `multer` memory storage with Cloudinary support and local `/uploads` fallback

### Database & Storage
- **Database**: [MongoDB](https://www.mongodb.com/)
- **ODM**: [Mongoose 8](https://mongoosejs.com/)
- **Compound Indexes**:
  - `Post`: `{ userId: 1, createdAt: -1 }`, `{ createdAt: -1, _id: -1 }`, `{ hashtags: 1 }`
  - `Follow`: `{ followerId: 1, followingId: 1 }` (unique), `{ followingId: 1 }`, `{ followerId: 1 }`
  - `Like`: `{ userId: 1, postId: 1 }` (unique), `{ postId: 1 }`
  - `Notification`: `{ userId: 1, read: 1, createdAt: -1 }`

---

## 📁 Repository Structure

```
socialConnect/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── client/                     # Frontend Single Page Application (React 19 + Vite)
│   ├── public/
│   │   └── 404.html            # SPA fallback routing for GitHub Pages
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI primitives (Avatar, Button, Input, Skeleton, EmptyState)
│   │   │   ├── CommentThread.jsx
│   │   │   ├── ContactList.jsx
│   │   │   ├── FriendRequestItem.jsx
│   │   │   ├── InfiniteScrollFeed.jsx
│   │   │   ├── MediaGrid.jsx
│   │   │   ├── NotificationList.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── PostComposer.jsx
│   │   │   ├── StoriesBar.jsx
│   │   │   ├── StoryViewer.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── UserSuggestionCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global user session & auth state provider
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx   # 3-column responsive layout
│   │   ├── lib/
│   │   │   ├── api.js          # Fetch wrapper with auto-prefixing & credentials
│   │   │   ├── cn.js           # Class merging helper
│   │   │   └── format.js       # Time ago & formatting helpers
│   │   ├── pages/              # Feed, Profile, Settings, Explore, Followers, Auth
│   │   ├── routes/             # ProtectedRoute wrapper
│   │   ├── App.jsx
│   │   ├── index.css           # Tailwind configuration & light/dark CSS variables
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Backend REST API (Express 5 + Mongoose)
│   ├── src/
│   │   ├── config/             # DB connection with auto-fallback & env validator
│   │   ├── controllers/        # Auth, Posts, Users, Engagement, Stories, Upload
│   │   ├── middleware/         # Auth, CSRF check, Zod validator, error handler
│   │   ├── models/             # Mongoose schemas (User, Post, Follow, Like, Comment, etc.)
│   │   ├── tests/              # Supertest integration tests
│   │   ├── utils/              # Token signer, cursor encoders, hashtag parser
│   │   ├── validators/         # Zod schemas for every request body and query
│   │   ├── app.js              # Express app factory
│   │   ├── index.js            # Server entrypoint
│   │   └── seed.js             # 12 demo users with rich interconnected activity
│   ├── package.json
│   └── .env.example
├── docker-compose.yml          # Local MongoDB container
├── package.json                # Workspace root orchestrator
└── README.md
```

---

## 📡 API Specification

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Authenticate with email/password & receive session cookie | ❌ |
| `POST` | `/api/auth/logout` | Clear session cookie | ❌ |
| `GET` | `/api/auth/me` | Fetch currently authenticated user session | ✅ |
| `GET` | `/api/feed` | Cursor-paginated home feed (`?tab=latest\|popular&cursor=...`) | ✅ |
| `POST` | `/api/posts` | Create new post with content and up to 10 images | ✅ |
| `GET` | `/api/posts/:id` | Retrieve single post with author and counts | Optional |
| `PUT` | `/api/posts/:id` | Edit own post content or media | ✅ |
| `DELETE`| `/api/posts/:id` | Delete own post | ✅ |
| `POST` | `/api/posts/:id/like` | Like or unlike a post (toggle) | ✅ |
| `GET` | `/api/posts/:id/comments` | Retrieve comments for a post | Optional |
| `POST` | `/api/posts/:id/comments` | Add a comment to a post | ✅ |
| `DELETE`| `/api/comments/:commentId` | Delete own comment | ✅ |
| `GET` | `/api/users/:id` | Get user profile by ID or username | Optional |
| `PUT` | `/api/users/:id` | Update profile bio, name, location, avatar, or cover | ✅ |
| `POST` | `/api/users/:id/follow` | Follow a user | ✅ |
| `DELETE`| `/api/users/:id/follow` | Unfollow a user | ✅ |
| `GET` | `/api/users/:id/followers`| List followers of a user | Optional |
| `GET` | `/api/users/:id/following`| List accounts followed by a user | Optional |
| `GET` | `/api/users/suggestions` | 2nd-degree social graph follow suggestions | ✅ |
| `GET` | `/api/stories` | View active stories from followed users | ✅ |
| `GET` | `/api/notifications` | View notifications feed | ✅ |
| `POST` | `/api/notifications/read` | Mark all notifications as read | ✅ |
| `POST` | `/api/upload` | Multipart upload for up to 10 images | ✅ |

---

## 💻 Local Development Setup

### 1. Prerequisites
- [Node.js 20+](https://nodejs.org/)
- MongoDB (Local instance, [MongoDB Atlas](https://www.mongodb.com/atlas), or Docker)

### 2. Clone & Install
```bash
git clone https://github.com/Anji0522/socialConnect.git
cd socialConnect
npm install --ignore-scripts
```

### 3. Environment Configuration
Create `server/.env` based on `.env.example`:
```bash
# Windows
copy .env.example server\.env

# macOS / Linux
cp .env.example server/.env
```

Review `server/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/socialconnect
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Optional Cloudinary (omitting automatically falls back to local /uploads storage)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 4. Seed the Database
Populate the database with 12 interconnected demo profiles, multi-image posts, stories, likes, and comments:
```bash
npm run seed
```

### 5. Launch the Application
Run both the Express API and Vite React client simultaneously:
```bash
npm run dev
```
- **Frontend SPA**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🧪 Testing & Code Quality

- **Linting**:
  ```bash
  npm run lint
  ```
  Runs ESLint across client components (configured with 0 warnings/errors).

- **Production Build**:
  ```bash
  npm run build
  ```
  Compiles Vite React client to `client/dist`.

- **API Integration Tests**:
  ```bash
  npm test
  ```
  Runs full integration tests covering user registration, authentication flow, post publishing, follow graph updates, cursor feed retrieval, liking, and commenting.

---

## 🗺️ Project Roadmap

### ✅ Phase 1: MVP (Complete)
- [x] Full Auth (Register, Login, Logout, JWT httpOnly cookie)
- [x] 3-Column Responsive Layout with light/dark theme toggle
- [x] Profiles with covers, avatars, counters, and post history
- [x] Post composer supporting hashtags and up to 10 images
- [x] Multi-image MediaGrid with `+N` tile layout
- [x] Cursor-paginated home feed (Latest & Popular tabs)
- [x] Follow/unfollow system with followers & following lists
- [x] Optimistic likes, comment threads, and comment deletion
- [x] Graph-based follow suggestions (mutuals discovery)
- [x] In-place post editing & "Read more" truncation

### 🔜 Phase 2: Engagement & Social Polish
- [ ] Direct story creation & video uploads with 24-hour expiration cron
- [ ] Bookmarks & Saved posts collection page
- [ ] Nested comment replies (multi-level threading) and comment likes
- [ ] Global search for users, posts, and `#hashtags`
- [ ] Rich notification badges with direct mentions
- [ ] Friend request accept/decline social mode toggle
- [ ] Content moderation: Report and block accounts

### 🔮 Phase 3: Realtime & Scaling
- [ ] Real-time Direct Messaging via **Socket.IO** (typing indicators, delivery receipts, active presence)
- [ ] Groups, Community Pages, and Event calendars
- [ ] Creator Analytics Dashboard with reach graphs and active hours ([Recharts](https://recharts.org))
- [ ] Redis caching for feed aggregation and active user presence
- [ ] Image auto-compression and WebP conversion pipeline

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
