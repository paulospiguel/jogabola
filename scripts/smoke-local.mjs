// Run against the local Compose stack. Creates one synthetic athlete per run.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";

const app = "http://localhost:3000";
const inbox = "http://localhost:8025";
const email = `qa-${randomUUID()}@example.test`;

async function post(path, body) {
  const response = await fetch(app + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: app },
    body: JSON.stringify(body),
  });
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  return response;
}

await post("/api/auth/email-otp/send-verification-otp", {
  email,
  type: "sign-in",
});

let messageId;
for (let attempt = 0; attempt < 30 && !messageId; attempt++) {
  const response = await fetch(`${inbox}/api/v1/search?query=to:${encodeURIComponent(email)}`);
  assert.ok(response.ok, "Mailpit search failed");
  const { messages } = await response.json();
  messageId = messages.find(message =>
    message.To?.some(recipient => recipient.Address === email)
  )?.ID;
  if (!messageId) await sleep(500);
}
assert.ok(messageId, "Mailpit did not capture the sign-in email");
const message = await (await fetch(`${inbox}/api/v1/message/${messageId}`)).json();
const otp = (message.Subject || message.Text)?.match(/\b\d{6}\b/)?.[0];
assert.ok(otp, "The captured message contains no six-digit code");

const login = await post("/api/auth/sign-in/email-otp", { email, otp, name: "Atleta QA" });
const cookie = login.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
assert.ok(cookie, "Login returned no session cookie");
const session = await fetch(`${app}/api/auth/get-session`, { headers: { Cookie: cookie } });
assert.ok(session.ok);
assert.equal((await session.json())?.user?.email, email);
console.log("OK: OTP captured locally and authenticated session read back.");
