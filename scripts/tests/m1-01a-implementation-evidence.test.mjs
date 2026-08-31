import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const evidence = readFileSync(
  new URL("../../docs/technical/m1-01a-initiative-core-implementation-evidence.md", import.meta.url),
  "utf8",
);

test("M1-01A evidence binds the exact reviewed Plane implementation and CI", () => {
  assert.match(evidence, /Plane PR #14/);
  assert.match(evidence, /7e712e06f41087c013f4a8ed8fd1ff9223f628c4/);
  assert.match(evidence, /99a73b4eab5ee21fd012d7358bc9259252d47f71/);
  assert.match(evidence, /fd1c18aa4754620bd3b0d28f3cb82af565c4e5a4/);
  assert.match(evidence, /33252718048/);
  assert.match(evidence, /364 passed/);
});

test("M1-01A evidence leaves the parent and UX-approved implementation child open", () => {
  assert.match(evidence, /M1-01 remains open/);
  assert.match(evidence, /M1-01B .*Plane implementation/s);
  assert.match(evidence, /approved[\s\S]*screen contract and test evidence/);
  assert.match(evidence, /packet[\s\S]*separate dispatch authority remain pending/);
});
