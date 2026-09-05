import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validatePublicContractEdition } from "../lib/public-contract-edition.mjs";

const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const edition = read("contracts/publication/public-contract-edition-v1.json");

test("sanitized public edition pins every included contract and grants no execution authority", () => {
  const result = validatePublicContractEdition(edition, read);
  assert.equal(result.edition, "curve-public-contracts-v1");
  assert.equal(result.executionAuthority, false);
  assert.ok(result.contracts > 60);
  const manifest = JSON.parse(edition);
  assert.equal(manifest.execution_authority, "NONE");
  assert.equal(manifest.legacy_approval_transfer, "PROHIBITED");
});

test("public edition rejects changed pins before reading any contract", () => {
  let reads = 0;
  assert.throws(() => validatePublicContractEdition(Buffer.concat([edition, Buffer.from(" ")]), () => {
    reads++;
  }), /PUBLIC_EDITION_CHANGED/);
  assert.equal(reads, 0);
});

test("public edition rejects contract drift under unchanged pins", () => {
  assert.throws(() => validatePublicContractEdition(edition, () => Buffer.from("{}")), /PUBLIC_CONTRACT_CHANGED/);
});
