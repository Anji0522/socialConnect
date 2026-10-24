const STORAGE_KEY = "socialconnect_mock_db_v3";
const SESSION_KEY = "socialconnect_mock_session_v3";

const defaultPeople = [
  { id: "usr_demo", username: "demo", email: "demo@socialconnect.dev", name: "Demo User", bio: "Log in as me to explore the feed.", location: "Everywhere", website: "https://socialconnect.dev", gender: "prefer_not_to_say", dob: "1998-05-12", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=60", coverUrl: "https://picsum.photos/seed/sc-cover11/1200/360" },
  { id: "usr_maya", username: "maya", email: "maya@socialconnect.dev", name: "Maya Chen", bio: "Photographer & weekend hiker.", location: "San Francisco", website: "https://mayachen.photo", gender: "female", dob: "1996-08-20", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=5", coverUrl: "https://picsum.photos/seed/sc-cover0/1200/360" },
  { id: "usr_jordan", username: "jordan", email: "jordan@socialconnect.dev", name: "Jordan Blake", bio: "Building products people love.", location: "Austin", website: "https://jordanblake.dev", gender: "male", dob: "1994-03-15", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=6", coverUrl: "https://picsum.photos/seed/sc-cover1/1200/360" },
  { id: "usr_priya", username: "priya", email: "priya@socialconnect.dev", name: "Priya Nair", bio: "Coffee, code, and city walks.", location: "Bengaluru", website: "https://priyanair.me", gender: "female", dob: "1997-11-04", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=7", coverUrl: "https://picsum.photos/seed/sc-cover2/1200/360" },
  { id: "usr_leo", username: "leo", email: "leo@socialconnect.dev", name: "Leo Martins", bio: "Street food hunter.", location: "Lisbon", website: "", gender: "male", dob: "1993-01-22", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=8", coverUrl: "https://picsum.photos/seed/sc-cover3/1200/360" },
  { id: "usr_nina", username: "nina", email: "nina@socialconnect.dev", name: "Nina Rossi", bio: "Design systems nerd.", location: "Milan", website: "https://ninarossi.design", gender: "female", dob: "1999-07-19", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=9", coverUrl: "https://picsum.photos/seed/sc-cover4/1200/360" },
  { id: "usr_samir", username: "samir", email: "samir@socialconnect.dev", name: "Samir Haddad", bio: "Music producer.", location: "Beirut", website: "", gender: "male", dob: "1992-12-10", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=10", coverUrl: "https://picsum.photos/seed/sc-cover5/1200/360" },
  { id: "usr_aisha", username: "aisha", email: "aisha@socialconnect.dev", name: "Aisha Okonkwo", bio: "Climate journalist.", location: "Lagos", website: "", gender: "female", dob: "1995-09-30", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=11", coverUrl: "https://picsum.photos/seed/sc-cover6/1200/360" },
  { id: "usr_ethan", username: "ethan", email: "ethan@socialconnect.dev", name: "Ethan Park", bio: "Trail runner.", location: "Seoul", website: "", gender: "male", dob: "1996-04-18", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=12", coverUrl: "https://picsum.photos/seed/sc-cover7/1200/360" },
  { id: "usr_sofia", username: "sofia", email: "sofia@socialconnect.dev", name: "Sofia Alvarez", bio: "Film stills & golden hour.", location: "Mexico City", website: "", gender: "female", dob: "1998-02-14", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=13", coverUrl: "https://picsum.photos/seed/sc-cover8/1200/360" },
  { id: "usr_owen", username: "owen", email: "owen@socialconnect.dev", name: "Owen Wright", bio: "Open source maintainer.", location: "Toronto", website: "https://github.com/owen", gender: "male", dob: "1991-06-08", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=14", coverUrl: "https://picsum.photos/seed/sc-cover9/1200/360" },
  { id: "usr_hana", username: "hana", email: "hana@socialconnect.dev", name: "Hana Suzuki", bio: "Ceramic studio days.", location: "Kyoto", website: "", gender: "female", dob: "1997-10-25", isPrivate: false, avatarUrl: "https://i.pravatar.cc/150?img=15", coverUrl: "https://picsum.photos/seed/sc-cover10/1200/360" },
];

const postCopies = [
  ["Golden hour on the waterfront. #travel #photo", 2, "San Francisco Bay"],
  ["Shipped a tiny feature that made support tickets drop. #buildinpublic", 1, "Austin, TX"],
  ["New café find: oat cortado and a window seat. #coffee", 3, "Bengaluru, India"],
  ["Sunday market haul. Tomatoes that actually smell like tomatoes. #food", 2, "Lisbon Market"],
  ["Sketching a calmer dashboard. Less chrome, more breathing room. #design", 1, "Milan, Italy"],
  ["Late-night mix in progress. Drums first, always. #music", 1, "Beirut Studio"],
  ["A coastline that still surprises me. #nature #travel", 4, "Lagos Coast"],
  ["10k before breakfast. Legs heavy, head clear. #running", 1, "Namsan Park, Seoul"],
  ["Color study from last night's shoot. #photo", 5, "Roma Norte, Mexico City"],
  ["If your API docs need a novel, the API is too clever. #dev", 0, "Toronto, ON"],
  ["The kiln opened. One cracked, eleven sang. #studio", 2, "Kyoto Ceramics"],
  ["Welcome to SocialConnect — follow people and the feed comes alive. #socialconnect", 1, "Global"],
  ["Rain on the studio window. Perfect excuse to stay in and edit. #photo", 2, "Studio 4B"],
  ["A thread of small kindnesses I noticed today. #community", 0, "Downtown"],
  ["Trying nested layouts until the sidebar feels inevitable. #design", 1, "Design Lab"],
];

function generateSeedState() {
  const users = defaultPeople.map((p) => ({
    ...p,
    password: "Password123!",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  }));

  const follows = [];
  const demo = users[0];
  for (let i = 1; i < 7; i++) {
    follows.push({ followerId: demo.id, followingId: users[i].id });
  }
  for (let i = 0; i < users.length; i++) {
    const a = users[i];
    const b = users[(i + 1) % users.length];
    if (a.id !== b.id) follows.push({ followerId: a.id, followingId: b.id });
  }

  const posts = [];
  for (let i = 0; i < postCopies.length; i++) {
    const [content, n, loc] = postCopies[i];
    const author = users[i % users.length];
    const media = Array.from({ length: n }, (_, p) => ({
      url: `https://picsum.photos/seed/sc${i}-${p}/900/700`,
      type: "image",
      position: p,
    }));
    posts.push({
      id: `post_${i + 1}`,
      userId: author.id,
      content,
      location: loc || "",
      media,
      createdAt: new Date(Date.now() - (i + 1) * 3600000 * 3).toISOString(),
    });
  }

  const likes = [];
  const comments = [];
  const bookmarks = [
    { userId: demo.id, postId: posts[0].id },
    { userId: demo.id, postId: posts[2].id },
  ];

  for (const post of posts) {
    for (const u of users.slice(0, 3)) {
      if (u.id !== post.userId) likes.push({ userId: u.id, postId: post.id });
    }
    const rootCommentId = `c_${post.id}_1`;
    comments.push({
      id: rootCommentId,
      postId: post.id,
      userId: users[1].id,
      content: "This is lovely — saving it.",
      parentId: null,
      likes: [users[0].id],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    });
    // add a nested reply to demo comments
    comments.push({
      id: `c_${post.id}_reply_1`,
      postId: post.id,
      userId: post.userId,
      content: "Thank you so much! Glad you liked it.",
      parentId: rootCommentId,
      likes: [],
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    });
  }

  const stories = users.slice(0, 8).map((u, i) => ({
    id: `story_${i}`,
    userId: u.id,
    mediaUrl: `https://picsum.photos/seed/scstory${i}/720/1280`,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  }));

  const friendRequests = [
    { id: "fr_1", fromId: users[7].id, toId: demo.id, status: "PENDING" },
    { id: "fr_2", fromId: users[8].id, toId: demo.id, status: "PENDING" },
  ];

  const notifications = [
    { id: "nt_1", userId: demo.id, type: "FOLLOW", actorId: users[1].id, createdAt: new Date(Date.now() - 1800000).toISOString(), read: false },
    { id: "nt_2", userId: demo.id, type: "LIKE", actorId: users[2].id, postId: posts[0].id, createdAt: new Date(Date.now() - 3600000).toISOString(), read: false },
  ];

  return { users, posts, follows, likes, comments, bookmarks, stories, friendRequests, notifications };
}

function getDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateSeedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    const initial = generateSeedState();
    return initial;
  }
}

function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn("Storage quota exceeded", e);
  }
}

function getViewerId() {
  return localStorage.getItem(SESSION_KEY) || null;
}

function publicProfile(user, db, viewerId) {
  if (!user) return null;
  const postCount = db.posts.filter((p) => p.userId === user.id).length;
  const followersCount = db.follows.filter((f) => f.followingId === user.id).length;
  const followingCount = db.follows.filter((f) => f.followerId === user.id).length;
  const isFollowing = viewerId
    ? db.follows.some((f) => f.followerId === viewerId && f.followingId === user.id)
    : false;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    gender: user.gender || "",
    dob: user.dob || "",
    isPrivate: Boolean(user.isPrivate),
    avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
    coverUrl: user.coverUrl || "",
    createdAt: user.createdAt,
    counts: { posts: postCount, followers: followersCount, following: followingCount },
    isFollowing,
    isMe: viewerId === user.id,
  };
}

function serializePost(post, db, viewerId) {
  const author = db.users.find((u) => u.id === post.userId);
  const likeCount = db.likes.filter((l) => l.postId === post.id).length;
  const commentCount = db.comments.filter((c) => c.postId === post.id).length;
  const likedByMe = viewerId ? db.likes.some((l) => l.postId === post.id && l.userId === viewerId) : false;
  const bookmarkedByMe = viewerId
    ? (db.bookmarks || []).some((b) => b.postId === post.id && b.userId === viewerId)
    : false;
  const followingAuthor =
    viewerId && author
      ? db.follows.some((f) => f.followerId === viewerId && f.followingId === author.id)
      : false;

  return {
    id: post.id,
    content: post.content || "",
    location: post.location || "",
    media: (post.media || []).sort((a, b) => a.position - b.position),
    createdAt: post.createdAt,
    author: publicProfile(author, db, viewerId),
    likeCount,
    commentCount,
    likedByMe,
    bookmarkedByMe,
    followingAuthor,
  };
}

export async function handleMockRequest(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const db = getDb();
  if (!db.bookmarks) db.bookmarks = [];
  let viewerId = getViewerId();

  // Extract path and query
  const parsedUrl = new URL(url, "http://localhost");
  const path = parsedUrl.pathname;
  const query = Object.fromEntries(parsedUrl.searchParams.entries());

  let body = {};
  if (options.body) {
    if (typeof options.body === "string") {
      try {
        body = JSON.parse(options.body);
      } catch {
        body = {};
      }
    } else if (options.body instanceof FormData) {
      body = options.body;
    }
  }

  // Artificial slight delay for realistic snappy response
  await new Promise((r) => setTimeout(r, 60));

  // --- 1. AUTH ---
  if (path === "/api/auth/register" && method === "POST") {
    const { username, email, password, name, gender, dob } = body;
    if (!username || !email || !password || !name) {
      throw new Error("All fields are required");
    }
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (db.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      throw new Error("Username is already taken");
    }
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error("Email is already registered");
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      username: cleanUsername,
      email: cleanEmail,
      name: name.trim(),
      password,
      gender: gender || "",
      dob: dob || "",
      website: "",
      isPrivate: false,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=4f46e5&color=fff`,
      coverUrl: "https://picsum.photos/seed/newcover/1200/360",
      bio: "Joined SocialConnect!",
      location: "",
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    // Auto follow demo user
    db.follows.push({ followerId: newUser.id, followingId: "usr_demo" });
    saveDb(db);

    localStorage.setItem(SESSION_KEY, newUser.id);
    return {
      user: publicProfile(newUser, db, newUser.id),
      accessToken: `mock_access_${newUser.id}`,
      refreshToken: `mock_refresh_${newUser.id}`,
    };
  }

  if (path === "/api/auth/login" && method === "POST") {
    const { email, password } = body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error("Invalid email or password");
    }
    if (user.password && user.password !== password && password !== "Password123!") {
      throw new Error("Invalid email or password");
    }

    localStorage.setItem(SESSION_KEY, user.id);
    return {
      user: publicProfile(user, db, user.id),
      accessToken: `mock_access_${user.id}`,
      refreshToken: `mock_refresh_${user.id}`,
    };
  }

  if (path === "/api/auth/refresh" && method === "POST") {
    const activeUser = db.users.find((u) => u.id === viewerId) || db.users[0];
    return {
      accessToken: `mock_access_${activeUser.id}`,
      refreshToken: `mock_refresh_${activeUser.id}`,
    };
  }

  if (path === "/api/auth/forgot-password" && method === "POST") {
    return { message: "If an account with that email exists, reset instructions have been sent." };
  }

  if (path === "/api/auth/reset-password" && method === "POST") {
    return { message: "Password has been reset successfully. Please log in." };
  }

  if (path.startsWith("/api/auth/verify-email") && method === "GET") {
    return { message: "Email verified successfully!" };
  }

  if (path === "/api/auth/resend-verification" && method === "POST") {
    return { message: "If your account is unverified, a new verification link has been sent." };
  }

  if (path === "/api/auth/logout" && method === "POST") {
    localStorage.removeItem(SESSION_KEY);
    return { ok: true };
  }

  if (path === "/api/auth/me" && method === "GET") {
    if (!viewerId) throw new Error("Unauthorized");
    const user = db.users.find((u) => u.id === viewerId);
    if (!user) {
      localStorage.removeItem(SESSION_KEY);
      throw new Error("User not found");
    }
    return { user: publicProfile(user, db, viewerId) };
  }

  // Require auth for protected paths
  if (!viewerId && !path.startsWith("/api/auth")) {
    throw new Error("Authentication required");
  }

  // --- 2. USERS ---
  if (path === "/api/users/suggestions" && method === "GET") {
    const myFollows = new Set(db.follows.filter((f) => f.followerId === viewerId).map((f) => f.followingId));
    myFollows.add(viewerId);
    const suggestions = db.users.filter((u) => !myFollows.has(u.id)).slice(0, 10);
    return { users: suggestions.map((u) => publicProfile(u, db, viewerId)) };
  }

  const userMatch = path.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch && method === "GET") {
    const identifier = userMatch[1].toLowerCase();
    const target = db.users.find((u) => u.id === identifier || u.username.toLowerCase() === identifier);
    if (!target) throw new Error("User not found");
    return { user: publicProfile(target, db, viewerId) };
  }

  if (userMatch && method === "PUT") {
    const target = db.users.find((u) => u.id === viewerId);
    if (!target) throw new Error("User not found");
    const allowed = ["name", "bio", "location", "avatarUrl", "coverUrl", "website", "gender", "dob", "isPrivate"];
    for (const key of allowed) {
      if (body[key] !== undefined) target[key] = body[key];
    }
    saveDb(db);
    return { user: publicProfile(target, db, viewerId) };
  }

  const followMatch = path.match(/^\/api\/users\/([^/]+)\/follow$/);
  if (followMatch) {
    const targetId = followMatch[1];
    if (method === "POST") {
      if (!db.follows.some((f) => f.followerId === viewerId && f.followingId === targetId)) {
        db.follows.push({ followerId: viewerId, followingId: targetId });
        db.notifications.push({
          id: `nt_${Date.now()}`,
          userId: targetId,
          type: "FOLLOW",
          actorId: viewerId,
          createdAt: new Date().toISOString(),
          read: false,
        });
        saveDb(db);
      }
      return { following: true };
    }
    if (method === "DELETE") {
      db.follows = db.follows.filter((f) => !(f.followerId === viewerId && f.followingId === targetId));
      saveDb(db);
      return { following: false };
    }
  }

  const followersMatch = path.match(/^\/api\/users\/([^/]+)\/followers$/);
  if (followersMatch && method === "GET") {
    const targetId = followersMatch[1];
    const followerIds = db.follows.filter((f) => f.followingId === targetId).map((f) => f.followerId);
    const users = db.users.filter((u) => followerIds.includes(u.id));
    return { users: users.map((u) => publicProfile(u, db, viewerId)) };
  }

  const followingMatch = path.match(/^\/api\/users\/([^/]+)\/following$/);
  if (followingMatch && method === "GET") {
    const targetId = followingMatch[1];
    const followingIds = db.follows.filter((f) => f.followerId === targetId).map((f) => f.followingId);
    const users = db.users.filter((u) => followingIds.includes(u.id));
    return { users: users.map((u) => publicProfile(u, db, viewerId)) };
  }

  const userPostsMatch = path.match(/^\/api\/users\/([^/]+)\/posts$/);
  if (userPostsMatch && method === "GET") {
    const targetId = userPostsMatch[1];
    const posts = db.posts
      .filter((p) => p.userId === targetId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { posts: posts.map((p) => serializePost(p, db, viewerId)) };
  }

  // --- 3. FEED & POSTS ---
  if (path === "/api/feed" && method === "GET") {
    const following = new Set(db.follows.filter((f) => f.followerId === viewerId).map((f) => f.followingId));
    following.add(viewerId);

    let feedPosts = db.posts.filter((p) => following.has(p.userId));

    if (query.tab === "popular") {
      feedPosts.sort((a, b) => {
        const aLikes = db.likes.filter((l) => l.postId === a.id).length;
        const bLikes = db.likes.filter((l) => l.postId === b.id).length;
        const aComm = db.comments.filter((c) => c.postId === a.id).length;
        const bComm = db.comments.filter((c) => c.postId === b.id).length;
        return bLikes * 2 + bComm - (aLikes * 2 + aComm);
      });
    } else {
      feedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const limit = Number(query.limit) || 8;
    const startIndex = query.cursor ? feedPosts.findIndex((p) => p.id === query.cursor) + 1 : 0;
    const page = feedPosts.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < feedPosts.length ? page[page.length - 1]?.id : null;

    return {
      posts: page.map((p) => serializePost(p, db, viewerId)),
      nextCursor,
    };
  }

  if (path === "/api/explore" && method === "GET") {
    const allPosts = [...db.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { posts: allPosts.map((p) => serializePost(p, db, viewerId)) };
  }

  if (path === "/api/posts/saved" && method === "GET") {
    const savedIds = new Set((db.bookmarks || []).filter((b) => b.userId === viewerId).map((b) => b.postId));
    const savedPosts = db.posts
      .filter((p) => savedIds.has(p.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { posts: savedPosts.map((p) => serializePost(p, db, viewerId)) };
  }

  if (path === "/api/posts" && method === "POST") {
    const { content, media, location } = body;
    const newPost = {
      id: `post_${Date.now()}`,
      userId: viewerId,
      content: content || "",
      location: location || "",
      media: media || [],
      createdAt: new Date().toISOString(),
    };
    db.posts.unshift(newPost);
    saveDb(db);
    return { post: serializePost(newPost, db, viewerId) };
  }

  const postBookmarkMatch = path.match(/^\/api\/posts\/([^/]+)\/bookmark$/);
  if (postBookmarkMatch) {
    const postId = postBookmarkMatch[1];
    if (method === "POST") {
      if (!db.bookmarks.some((b) => b.postId === postId && b.userId === viewerId)) {
        db.bookmarks.push({ postId, userId: viewerId });
        saveDb(db);
      }
      return { bookmarked: true };
    }
    if (method === "DELETE") {
      db.bookmarks = db.bookmarks.filter((b) => !(b.postId === postId && b.userId === viewerId));
      saveDb(db);
      return { bookmarked: false };
    }
  }

  const postItemMatch = path.match(/^\/api\/posts\/([^/]+)$/);
  if (postItemMatch) {
    const postId = postItemMatch[1];
    if (method === "GET") {
      const p = db.posts.find((x) => x.id === postId);
      if (!p) throw new Error("Post not found");
      return { post: serializePost(p, db, viewerId) };
    }
    if (method === "PUT") {
      const p = db.posts.find((x) => x.id === postId);
      if (!p) throw new Error("Post not found");
      if (p.userId !== viewerId) throw new Error("Forbidden");
      if (body.content !== undefined) p.content = body.content;
      if (body.location !== undefined) p.location = body.location;
      if (body.media !== undefined) p.media = body.media;
      saveDb(db);
      return { post: serializePost(p, db, viewerId) };
    }
    if (method === "DELETE") {
      db.posts = db.posts.filter((x) => x.id !== postId);
      db.likes = db.likes.filter((l) => l.postId !== postId);
      db.comments = db.comments.filter((c) => c.postId !== postId);
      db.bookmarks = db.bookmarks.filter((b) => b.postId !== postId);
      saveDb(db);
      return { ok: true };
    }
  }

  // --- 4. ENGAGEMENT ---
  const likeMatch = path.match(/^\/api\/posts\/([^/]+)\/like$/);
  if (likeMatch) {
    const postId = likeMatch[1];
    if (method === "POST") {
      if (!db.likes.some((l) => l.postId === postId && l.userId === viewerId)) {
        db.likes.push({ postId, userId: viewerId });
        const post = db.posts.find((p) => p.id === postId);
        if (post && post.userId !== viewerId) {
          db.notifications.push({
            id: `nt_${Date.now()}`,
            userId: post.userId,
            type: "LIKE",
            actorId: viewerId,
            postId,
            createdAt: new Date().toISOString(),
            read: false,
          });
        }
        saveDb(db);
      }
      const count = db.likes.filter((l) => l.postId === postId).length;
      return { liked: true, likeCount: count };
    }
    if (method === "DELETE") {
      db.likes = db.likes.filter((l) => !(l.postId === postId && l.userId === viewerId));
      saveDb(db);
      const count = db.likes.filter((l) => l.postId === postId).length;
      return { liked: false, likeCount: count };
    }
  }

  // Comment Likes
  const commentLikeMatch = path.match(/^\/api\/comments\/([^/]+)\/like$/);
  if (commentLikeMatch) {
    const commentId = commentLikeMatch[1];
    const comment = db.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error("Comment not found");
    if (!comment.likes) comment.likes = [];

    if (method === "POST") {
      if (!comment.likes.includes(viewerId)) {
        comment.likes.push(viewerId);
        saveDb(db);
      }
      return { liked: true, likesCount: comment.likes.length };
    }
    if (method === "DELETE") {
      comment.likes = comment.likes.filter((id) => id !== viewerId);
      saveDb(db);
      return { liked: false, likesCount: comment.likes.length };
    }
  }

  const editCommentMatch = path.match(/^\/api\/comments\/([^/]+)$/);
  if (editCommentMatch) {
    const commentId = editCommentMatch[1];
    const comment = db.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error("Comment not found");

    if (method === "PUT") {
      if (comment.userId !== viewerId) throw new Error("Forbidden");
      comment.content = body.content || comment.content;
      comment.updatedAt = new Date().toISOString();
      saveDb(db);
      return {
        comment: {
          ...comment,
          author: publicProfile(db.users.find((u) => u.id === comment.userId), db, viewerId),
          likesCount: (comment.likes || []).length,
          likedByMe: (comment.likes || []).includes(viewerId),
        },
      };
    }
    if (method === "DELETE") {
      if (comment.userId !== viewerId) throw new Error("Forbidden");
      // Remove comment and its direct replies
      db.comments = db.comments.filter((c) => c.id !== commentId && c.parentId !== commentId);
      saveDb(db);
      return { ok: true };
    }
  }

  const commentsMatch = path.match(/^\/api\/posts\/([^/]+)\/comments$/);
  if (commentsMatch) {
    const postId = commentsMatch[1];
    if (method === "GET") {
      const postComments = db.comments.filter((c) => c.postId === postId);
      const rootComments = postComments.filter((c) => !c.parentId);

      const formatted = rootComments.map((root) => {
        const replies = postComments
          .filter((c) => c.parentId === root.id)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((r) => ({
            ...r,
            author: publicProfile(db.users.find((u) => u.id === r.userId), db, viewerId),
            likesCount: (r.likes || []).length,
            likedByMe: viewerId ? (r.likes || []).includes(viewerId) : false,
          }));

        return {
          ...root,
          author: publicProfile(db.users.find((u) => u.id === root.userId), db, viewerId),
          likesCount: (root.likes || []).length,
          likedByMe: viewerId ? (root.likes || []).includes(viewerId) : false,
          replies,
        };
      });

      return { comments: formatted };
    }
    if (method === "POST") {
      const newComment = {
        id: `c_${Date.now()}`,
        postId,
        userId: viewerId,
        content: body.content,
        parentId: body.parentId || null,
        likes: [],
        createdAt: new Date().toISOString(),
      };
      db.comments.push(newComment);

      const post = db.posts.find((p) => p.id === postId);
      if (post && post.userId !== viewerId) {
        db.notifications.push({
          id: `nt_${Date.now()}`,
          userId: post.userId,
          type: "COMMENT",
          actorId: viewerId,
          postId,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
      saveDb(db);

      return {
        comment: {
          ...newComment,
          author: publicProfile(db.users.find((u) => u.id === viewerId), db, viewerId),
          likesCount: 0,
          likedByMe: false,
          replies: [],
        },
      };
    }
  }

  // --- 5. DIRECT MESSAGES ---
  if (!db.messages) db.messages = [];
  if (!db.conversations) db.conversations = [];
  if (!db.storyViews) db.storyViews = [];
  if (!db.reports) db.reports = [];

  if (path === "/api/conversations" && method === "GET") {
    // Generate active conversations from other users
    const otherUsers = db.users.filter((u) => u.id !== viewerId).slice(0, 6);
    const convs = otherUsers.map((other, idx) => {
      const userMessages = db.messages.filter(
        (m) => (m.senderId === viewerId && m.recipientId === other.id) || (m.senderId === other.id && m.recipientId === viewerId)
      );
      const lastMsg = userMessages[userMessages.length - 1] || {
        id: `msg_seed_${idx}`,
        text: idx % 2 === 0 ? "Hey! Loved your recent post." : "Are you around this weekend?",
        createdAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
        senderId: other.id,
      };
      return {
        id: `conv_${other.id}`,
        otherUser: publicProfile(other, db, viewerId),
        lastMessage: lastMsg,
        unreadCount: idx === 0 ? 1 : 0,
        updatedAt: lastMsg.createdAt,
      };
    });
    return { conversations: convs };
  }

  const messagesMatch = path.match(/^\/api\/messages\/([^/]+)$/);
  if (messagesMatch && method === "GET") {
    const recipientId = messagesMatch[1];
    const msgs = db.messages
      .filter(
        (m) =>
          (m.senderId === viewerId && m.recipientId === recipientId) ||
          (m.senderId === recipientId && m.recipientId === viewerId)
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // If no messages yet, seed an initial friendly greeting
    if (msgs.length === 0) {
      const otherUser = db.users.find((u) => u.id === recipientId);
      if (otherUser) {
        msgs.push({
          id: `seed_msg_${recipientId}`,
          senderId: recipientId,
          recipientId: viewerId,
          sender: publicProfile(otherUser, db, viewerId),
          text: `Hey @${viewerId === "usr_demo" ? "demo" : "there"}, welcome to SocialConnect! Feel free to message me anytime.`,
          seen: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        });
      }
    }

    return {
      conversationId: `conv_${recipientId}`,
      messages: msgs,
    };
  }

  if (path === "/api/messages" && method === "POST") {
    const { recipientId, text, mediaUrl } = body;
    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: viewerId,
      recipientId,
      text: text || "",
      mediaUrl: mediaUrl || "",
      seen: false,
      createdAt: new Date().toISOString(),
    };
    db.messages.push(newMsg);
    saveDb(db);
    return { message: newMsg };
  }

  // --- 6. SAFETY & MODERATION (Block, Mute, Report) ---
  const blockMatch = path.match(/^\/api\/users\/([^/]+)\/block$/);
  if (blockMatch) {
    const targetId = blockMatch[1];
    const user = db.users.find((u) => u.id === viewerId);
    if (!user.blockedUsers) user.blockedUsers = [];
    if (method === "POST") {
      if (!user.blockedUsers.includes(targetId)) user.blockedUsers.push(targetId);
      saveDb(db);
      return { blocked: true };
    }
    if (method === "DELETE") {
      user.blockedUsers = user.blockedUsers.filter((id) => id !== targetId);
      saveDb(db);
      return { blocked: false };
    }
  }

  const muteMatch = path.match(/^\/api\/users\/([^/]+)\/mute$/);
  if (muteMatch) {
    const targetId = muteMatch[1];
    const user = db.users.find((u) => u.id === viewerId);
    if (!user.mutedUsers) user.mutedUsers = [];
    if (method === "POST") {
      if (!user.mutedUsers.includes(targetId)) user.mutedUsers.push(targetId);
      saveDb(db);
      return { muted: true };
    }
    if (method === "DELETE") {
      user.mutedUsers = user.mutedUsers.filter((id) => id !== targetId);
      saveDb(db);
      return { muted: false };
    }
  }

  if (path === "/api/reports" && method === "POST") {
    db.reports.push({
      id: `rep_${Date.now()}`,
      reporter: viewerId,
      targetUserId: body.targetUserId,
      reason: body.reason,
      createdAt: new Date().toISOString(),
    });
    saveDb(db);
    return { message: "Report submitted successfully for safety review." };
  }

  // --- 7. SEARCH ---
  if (path === "/api/search" && method === "GET") {
    const q = (query.q || "").toLowerCase().replace(/^[#@]/, "").trim();
    const matchedUsers = db.users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
    );
    const hashtags = [
      { tag: "travel", postCount: 24 },
      { tag: "photo", postCount: 19 },
      { tag: "design", postCount: 15 },
      { tag: "buildinpublic", postCount: 12 },
      { tag: "coffee", postCount: 9 },
      { tag: "community", postCount: 7 },
    ].filter((h) => !q || h.tag.includes(q));

    return {
      users: matchedUsers.map((u) => publicProfile(u, db, viewerId)),
      hashtags,
      trending: hashtags.slice(0, 5),
    };
  }

  // --- 8. STORIES, NOTIFICATIONS, FRIEND REQUESTS, UPLOAD ---
  if (path === "/api/stories" && method === "POST") {
    const newStory = {
      id: `story_${Date.now()}`,
      userId: viewerId,
      mediaUrl: body.mediaUrl,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
    db.stories.unshift(newStory);
    saveDb(db);
    return { story: newStory };
  }

  const storyViewMatch = path.match(/^\/api\/stories\/([^/]+)\/view$/);
  if (storyViewMatch && method === "POST") {
    const storyId = storyViewMatch[1];
    db.storyViews.push({ storyId, viewerId, viewedAt: new Date().toISOString() });
    saveDb(db);
    return { ok: true };
  }

  const storyViewersMatch = path.match(/^\/api\/stories\/([^/]+)\/viewers$/);
  if (storyViewersMatch && method === "GET") {
    const viewers = db.users.slice(1, 4).map((u) => ({
      user: publicProfile(u, db, viewerId),
      viewedAt: new Date(Date.now() - 1800000).toISOString(),
    }));
    return { viewers };
  }

  const storyReactMatch = path.match(/^\/api\/stories\/([^/]+)\/react$/);
  if (storyReactMatch && method === "POST") {
    return { ok: true };
  }

  if (path === "/api/stories" && method === "GET") {
    const grouped = {};
    for (const s of db.stories) {
      if (!grouped[s.userId]) grouped[s.userId] = [];
      grouped[s.userId].push(s);
    }
    const userGroups = [];
    for (const [uid, items] of Object.entries(grouped)) {
      const user = db.users.find((u) => u.id === uid);
      if (user) {
        userGroups.push({
          user: publicProfile(user, db, viewerId),
          items,
          seen: false,
        });
      }
    }
    return { stories: userGroups };
  }

  if (path === "/api/notifications" && method === "GET") {
    const notes = db.notifications
      .filter((n) => n.userId === viewerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return {
      notifications: notes.map((n) => ({
        ...n,
        actor: publicProfile(db.users.find((u) => u.id === n.actorId), db, viewerId),
      })),
    };
  }

  if (path === "/api/notifications/read" && method === "POST") {
    for (const n of db.notifications) {
      if (n.userId === viewerId) n.read = true;
    }
    saveDb(db);
    return { ok: true };
  }

  if (path === "/api/friend-requests" && method === "GET") {
    const reqs = db.friendRequests.filter((r) => r.toId === viewerId && r.status === "PENDING");
    return {
      requests: reqs.map((r) => ({
        ...r,
        from: publicProfile(db.users.find((u) => u.id === r.fromId), db, viewerId),
      })),
    };
  }

  const friendReqAction = path.match(/^\/api\/friend-requests\/([^/]+)$/);
  if (friendReqAction && method === "POST") {
    const fr = db.friendRequests.find((r) => r.id === friendReqAction[1]);
    if (fr) {
      fr.status = body.status || "ACCEPTED";
      saveDb(db);
    }
    return { ok: true };
  }

  if (path === "/api/upload" && method === "POST") {
    const urls = [];
    if (body instanceof FormData) {
      const files = body.getAll("files");
      for (const file of files) {
        if (typeof file === "object" && file.name) {
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          urls.push(dataUrl);
        }
      }
    }
    if (!urls.length) {
      urls.push(`https://picsum.photos/seed/up${Date.now()}/800/600`);
    }
    return { urls };
  }

  throw new Error(`Endpoint not found: ${method} ${path}`);
}
