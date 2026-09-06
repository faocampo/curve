import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";

const read = (path) => JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));
const policy = read("contracts/policy/prd-policy-v1.json");
const validate = new Ajv2020({ strict: false }).compile(read("contracts/schemas/prd-policy-manifest-v1.schema.json"));

test("PRD policy has an independent closed identity and four exact actions", () => {
  assert.equal(validate(policy), true);
  assert.equal(policy.policy_key, "CURVE_PRD_POLICY");
  assert.deepEqual(policy.actions.map((x) => x.action), ["SUBMIT", "APPROVE", "REQUEST_CHANGES", "REJECT"].map((x) => `CURVE.PRD.${x}`));
  for (const action of policy.actions) {
    assert.deepEqual(action.allowed_actor_types, ["HUMAN"]);
    assert.deepEqual(action.permitted_projection, ["NO_BODY"]);
    assert.equal(action.separation_of_duty, "PRD_THREE_ACTIVE_HUMANS");
  }
});

for (const [name, change] of [
  ["default allow", (p) => { p.default_effect = "ALLOW"; }],
  ["inline authority", (p) => { p.actor = "synthetic"; }],
  ["missing action", (p) => { p.actions.pop(); }],
  ["administrator approval", (p) => { p.actions[1].allowed_roles.push("PLATFORM_ADMINISTRATOR"); }],
  ["service approval", (p) => { p.actions[1].allowed_actor_types.push("SERVICE"); }],
  ["relaxed separation", (p) => { p.actions[1].separation_of_duty = "NONE"; }],
  ["body projection", (p) => { p.actions[1].permitted_projection = ["BODY"]; }],
]) {
  test(`immutable candidate rejects ${name}`, () => {
    const changed = structuredClone(policy); change(changed); assert.equal(validate(changed), false);
  });
}
