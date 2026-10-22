import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { startTestApp } from "./helpers.js";

test("register, login, me, logout", async () => {
  const { app, stop } = await startTestApp();
  try {
    const register = await request(app).post("/api/auth/register").send({
      username: "maya",
      email: "maya@test.com",
      password: "Password123!",
      name: "Maya Chen",
    });
    assert.equal(register.status, 201);
    assert.equal(register.body.user.username, "maya");
    const cookie = register.headers["set-cookie"];
    assert.ok(cookie);

    const me = await request(app).get("/api/auth/me").set("Cookie", cookie);
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, "maya@test.com");

    await request(app).post("/api/auth/logout").set("Cookie", cookie);

    const login = await request(app).post("/api/auth/login").send({
      email: "maya@test.com",
      password: "Password123!",
    });
    assert.equal(login.status, 200);
  } finally {
    await stop();
  }
});
