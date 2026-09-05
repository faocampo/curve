import assert from "node:assert/strict";
import test from "node:test";
import { scanPublicDisclosure } from "../lib/public-disclosure.mjs";
import { assertPublicationNotWithdrawn } from "../lib/publication-withdrawal.mjs";
import { authorizeCodingAgentTaskPacketForExecution } from "../lib/coding-agent-implementation-authorization.mjs";

test("disclosure findings expose rule and location without echoing the value", () => {
  const value = ["/Users", "private-person", "source"].join("/");
  const findings = scanPublicDisclosure(`example\n${value}`, "fixture.md");
  assert.deepEqual(findings, [{ path: "fixture.md", rule: "personal-home-path", line: 2 }]);
  assert.equal(JSON.stringify(findings).includes("private-person"), false);
});

test("reserved synthetic examples and public repository clone identities pass", () => {
  assert.deepEqual(scanPublicDisclosure("reviewer@example.invalid git@github.com:example/repository.git https://api.example.test"), []);
});

test("credential-shaped and private document examples are rejected", () => {
  for (const value of [
    ["-----BEGIN ", "PRIVATE KEY-----"].join(""),
    "AK" + "IA" + "A".repeat(16),
    "gh" + "p_" + "a".repeat(36),
    "https://docs.google.com/" + "document/d/" + "synthetic".repeat(3),
    "123-" + "synthetic" + ".apps.googleusercontent.com",
    "https://service." + "corp/",
    "person@" + "organization.local",
  ]) assert.ok(scanPublicDisclosure(value).length > 0);
});

test("withdrawn publication is denied before authority callbacks or provider effects", () => {
  let calls = 0;
  for (const packet_version of [1, 2, 3]) {
    const packet = { packet_id: "CURVE-M1-01B", packet_version };
    assert.throws(() => assertPublicationNotWithdrawn(packet), /PUBLICATION_WITHDRAWN/);
    assert.throws(() => authorizeCodingAgentTaskPacketForExecution(packet, {}, {
      verifyHumanAuthority: () => { calls++; },
    }), /PUBLICATION_WITHDRAWN/);
  }
  assert.equal(calls, 0);
  assert.doesNotThrow(() => assertPublicationNotWithdrawn({ packet_id: "CURVE-M1-01B", packet_version: 4 }));
});
