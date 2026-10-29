import "dotenv/config";
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../src/app.js";

vi.mock("../src/config/db.js", () => ({
  connectDB: async () => {},
}));

function tokenFor(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "5m",
  });
}

describe("POST /api/ai", () => {
  it("answers 401 when there is no token", async () => {
    const res = await request(app)
      .post("/api/ai")
      .send({ prompt: "A course submission tracker in React." });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(
      "No token. Send Authorization: Bearer <token>",
    );
  });

  it("answers 401 when the token was signed with another secret", async () => {
    const forged = jwt.sign({ userId: "someone" }, "not-the-secret");

    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${forged}`)
      .send({ prompt: "A course submission tracker in React." });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token is invalid or has expired");
  });

  it("lets a valid token through, then checks the body", async () => {
    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${tokenFor("test-user")}`)
      .send({ prompt: "Too short" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      "Describe the item report in at least 20 characters.",
    ]);
  });
});
