import bcrypt from "bcryptjs";
import { connectDb, disconnectDb } from "./config/db.js";
import {
  Comment,
  Follow,
  FriendRequest,
  Hashtag,
  Like,
  Notification,
  Post,
  Story,
  User,
} from "./models/index.js";
import { extractHashtags } from "./utils/hashtags.js";

const PASSWORD = "Password123!";

const people = [
  { username: "maya", email: "maya@socialconnect.dev", name: "Maya Chen", bio: "Photographer & weekend hiker.", location: "San Francisco" },
  { username: "jordan", email: "jordan@socialconnect.dev", name: "Jordan Blake", bio: "Building products people love.", location: "Austin" },
  { username: "priya", email: "priya@socialconnect.dev", name: "Priya Nair", bio: "Coffee, code, and city walks.", location: "Bengaluru" },
  { username: "leo", email: "leo@socialconnect.dev", name: "Leo Martins", bio: "Street food hunter.", location: "Lisbon" },
  { username: "nina", email: "nina@socialconnect.dev", name: "Nina Rossi", bio: "Design systems nerd.", location: "Milan" },
  { username: "samir", email: "samir@socialconnect.dev", name: "Samir Haddad", bio: "Music producer.", location: "Beirut" },
  { username: "aisha", email: "aisha@socialconnect.dev", name: "Aisha Okonkwo", bio: "Climate journalist.", location: "Lagos" },
  { username: "ethan", email: "ethan@socialconnect.dev", name: "Ethan Park", bio: "Trail runner.", location: "Seoul" },
  { username: "sofia", email: "sofia@socialconnect.dev", name: "Sofia Alvarez", bio: "Film stills & golden hour.", location: "Mexico City" },
  { username: "owen", email: "owen@socialconnect.dev", name: "Owen Wright", bio: "Open source maintainer.", location: "Toronto" },
  { username: "hana", email: "hana@socialconnect.dev", name: "Hana Suzuki", bio: "Ceramic studio days.", location: "Kyoto" },
  { username: "demo", email: "demo@socialconnect.dev", name: "Demo User", bio: "Log in as me to explore the feed.", location: "Everywhere" },
];

const postCopy = [
  ["Golden hour on the waterfront. #travel #photo", 2],
  ["Shipped a tiny feature that made support tickets drop. #buildinpublic", 1],
  ["New café find: oat cortado and a window seat. #coffee", 3],
  ["Sunday market haul. Tomatoes that actually smell like tomatoes. #food", 2],
  ["Sketching a calmer dashboard. Less chrome, more breathing room. #design", 1],
  ["Late-night mix in progress. Drums first, always. #music", 1],
  ["A coastline that still surprises me. #nature #travel", 4],
  ["10k before breakfast. Legs heavy, head clear. #running", 1],
  ["Color study from last night's shoot. #photo", 5],
  ["If your API docs need a novel, the API is too clever. #dev", 0],
  ["The kiln opened. One cracked, eleven sang. #studio", 2],
  ["Welcome to SocialConnect — follow people and the feed comes alive. #socialconnect", 1],
  ["Rain on the studio window. Perfect excuse to stay in and edit. #photo", 2],
  ["A thread of small kindnesses I noticed today.", 0],
  ["Trying nested layouts until the sidebar feels inevitable. #design", 1],
];

function img(seed, w = 800, h = 600) {
  return `https://picsum.photos/seed/sc${seed}/${w}/${h}`;
}

async function run() {
  await connectDb();
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Follow.deleteMany({}),
    Like.deleteMany({}),
    Comment.deleteMany({}),
    Story.deleteMany({}),
    Notification.deleteMany({}),
    FriendRequest.deleteMany({}),
    Hashtag.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const users = await User.insertMany(
    people.map((p, i) => ({
      ...p,
      passwordHash,
      avatarUrl: `https://i.pravatar.cc/150?img=${i + 5}`,
      coverUrl: img(`cover${i}`, 1200, 360),
    })),
  );

  const demo = users.find((u) => u.username === "demo");
  const others = users.filter((u) => u.username !== "demo");

  const follows = [];
  for (const u of others.slice(0, 7)) {
    follows.push({ followerId: demo._id, followingId: u._id });
  }
  for (let i = 0; i < users.length; i++) {
    const a = users[i];
    const b = users[(i + 1) % users.length];
    const c = users[(i + 3) % users.length];
    if (a._id.toString() !== b._id.toString()) follows.push({ followerId: a._id, followingId: b._id });
    if (a._id.toString() !== c._id.toString()) follows.push({ followerId: a._id, followingId: c._id });
  }
  await Follow.insertMany(follows);

  const posts = [];
  for (let i = 0; i < postCopy.length; i++) {
    const [content, n] = postCopy[i];
    const author = users[i % users.length];
    const media = Array.from({ length: n }, (_, p) => ({
      url: img(`${i}-${p}`, 900, 700),
      position: p,
    }));
    posts.push({
      userId: author._id,
      content,
      hashtags: extractHashtags(content),
      media,
      createdAt: new Date(Date.now() - i * 36e5),
    });
  }
  const createdPosts = await Post.insertMany(posts);

  const likes = [];
  const comments = [];
  for (const post of createdPosts) {
    for (const u of users.slice(0, 4)) {
      if (u._id.toString() !== post.userId.toString()) {
        likes.push({ userId: u._id, postId: post._id });
      }
    }
    comments.push({
      userId: users[1]._id,
      postId: post._id,
      content: "This is lovely — saving it.",
    });
    comments.push({
      userId: users[2]._id,
      postId: post._id,
      content: "Need this energy today.",
    });
  }
  await Like.insertMany(likes);
  await Comment.insertMany(comments);

  const expiresAt = new Date(Date.now() + 20 * 60 * 60 * 1000);
  await Story.insertMany(
    users.slice(0, 8).map((u, i) => ({
      userId: u._id,
      mediaUrl: img(`story${i}`, 720, 1280),
      expiresAt,
    })),
  );

  await FriendRequest.insertMany([
    { fromId: users[8]._id, toId: demo._id, status: "PENDING" },
    { fromId: users[9]._id, toId: demo._id, status: "PENDING" },
    { fromId: users[10]._id, toId: demo._id, status: "PENDING" },
  ]);

  await Notification.insertMany([
    { userId: demo._id, type: "FOLLOW", actorId: users[0]._id },
    { userId: demo._id, type: "LIKE", actorId: users[1]._id, postId: createdPosts[0]._id },
    { userId: demo._id, type: "COMMENT", actorId: users[2]._id, postId: createdPosts[1]._id },
  ]);

  console.log("Seeded SocialConnect demo data.");
  console.log("Login: demo@socialconnect.dev / Password123!");
  await disconnectDb();
}

run().catch(async (err) => {
  console.error(err);
  await disconnectDb();
  process.exit(1);
});
