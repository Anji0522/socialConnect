import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { startTestApp } from "./helpers.js";

test("direct messages, block and private follow requests", async () => {
  const { app, stop } = await startTestApp();
  try {
    // 1. Register User A (Alice)
    const userARes = await request(app).post("/api/auth/register").send({
      username: "alice_chat",
      email: "alice_chat@test.com",
      password: "Password123!",
      name: "Alice Chat",
    });
    assert.equal(userARes.status, 201);
    const cookieA = userARes.headers["set-cookie"];
    const userAId = userARes.body.user.id;

    // 2. Register User B (Bob, Private account)
    const userBRes = await request(app).post("/api/auth/register").send({
      username: "bob_private",
      email: "bob_private@test.com",
      password: "Password123!",
      name: "Bob Private",
    });
    assert.equal(userBRes.status, 201);
    const cookieB = userBRes.headers["set-cookie"];
    const userBId = userBRes.body.user.id;

    // Set Bob to private
    await request(app)
      .put(`/api/users/${userBId}`)
      .set("Cookie", cookieB)
      .send({ isPrivate: true });

    // 3. User A requests to follow User B
    const followReq = await request(app)
      .post(`/api/users/${userBId}/follow`)
      .set("Cookie", cookieA);
    assert.equal(followReq.status, 200);
    assert.equal(followReq.body.requested, true);

    // 4. Send Direct Message from User A to User B
    const msgRes = await request(app)
      .post("/api/messages")
      .set("Cookie", cookieA)
      .send({
        recipientId: userBId,
        text: "Hello Bob, please accept my request!",
      });
    assert.equal(msgRes.status, 201);
    assert.equal(msgRes.body.message.text, "Hello Bob, please accept my request!");

    // 5. User B fetches messages
    const getMsgs = await request(app)
      .get(`/api/messages/${userAId}`)
      .set("Cookie", cookieB);
    assert.equal(getMsgs.status, 200);
    assert.equal(getMsgs.body.messages.length, 1);

    // 6. User B blocks User A
    const blockRes = await request(app)
      .post(`/api/users/${userAId}/block`)
      .set("Cookie", cookieB);
    assert.equal(blockRes.status, 200);
    assert.equal(blockRes.body.blocked, true);

    // 7. User A tries to send message to User B (should be forbidden)
    const blockedMsg = await request(app)
      .post("/api/messages")
      .set("Cookie", cookieA)
      .send({
        recipientId: userBId,
        text: "Are you there?",
      });
    assert.equal(blockedMsg.status, 403);

    // 8. User B unblocks User A
    const unblockRes = await request(app)
      .delete(`/api/users/${userAId}/block`)
      .set("Cookie", cookieB);
    assert.equal(unblockRes.status, 200);
    assert.equal(unblockRes.body.blocked, false);
  } finally {
    await stop();
  }
});
