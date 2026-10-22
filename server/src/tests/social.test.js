import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { startTestApp } from "./helpers.js";

async function register(app, username) {
  const res = await request(app).post("/api/auth/register").send({
    username,
    email: `${username}@test.com`,
    password: "Password123!",
    name: username,
  });
  return { cookie: res.headers["set-cookie"], user: res.body.user };
}

test("post, follow, feed, like, comment", async () => {
  const { app, stop } = await startTestApp();
  try {
    const a = await register(app, "alice");
    const b = await register(app, "bob");

    const post = await request(app)
      .post("/api/posts")
      .set("Cookie", b.cookie)
      .send({ content: "Hello from Bob #intro" });
    assert.equal(post.status, 201);

    await request(app).post(`/api/users/${b.user.id}/follow`).set("Cookie", a.cookie);

    const feed = await request(app).get("/api/feed?tab=latest").set("Cookie", a.cookie);
    assert.equal(feed.status, 200);
    assert.equal(feed.body.posts.length >= 1, true);
    assert.equal(feed.body.posts[0].content.includes("Hello from Bob"), true);

    const like = await request(app).post(`/api/posts/${post.body.post.id}/like`).set("Cookie", a.cookie);
    assert.equal(like.body.liked, true);

    const comment = await request(app)
      .post(`/api/posts/${post.body.post.id}/comments`)
      .set("Cookie", a.cookie)
      .send({ content: "Nice post" });
    assert.equal(comment.status, 201);
  } finally {
    await stop();
  }
});
