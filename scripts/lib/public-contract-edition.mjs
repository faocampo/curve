import { createHash } from "node:crypto";

// Explicitly authorized sanitized public edition. This is a content pin,
// independent of and incapable of supplying execution or deployment authority.
const EDITION_SHA256 = "952c95b463c9613581527a0cf6e7d900893145c824296048d0ea9288e963b7d3";
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function validatePublicContractEdition(bytes, readContract) {
  if (digest(bytes) !== EDITION_SHA256) {
    throw new Error("PUBLIC_EDITION_CHANGED: a reviewed successor edition is required");
  }
  const edition = JSON.parse(bytes);
  for (const contract of edition.contracts) {
    if (digest(readContract(contract.path)) !== contract.sha256) {
      throw new Error(`PUBLIC_CONTRACT_CHANGED: ${contract.path}`);
    }
  }
  return { edition: edition.edition_id, contracts: edition.contracts.length, executionAuthority: false };
}
