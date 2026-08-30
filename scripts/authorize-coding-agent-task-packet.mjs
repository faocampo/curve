#!/usr/bin/env node

import { resolve } from "node:path";

function usage() {
  return [
    "usage: authorize-coding-agent-task-packet.mjs",
    "  --packet-id CURVE-<ID>",
    "  --authorization-id CURVE-AUTH-<ID>",
    "  --authorization-version <positive integer>",
    "  --attempt-id <UUID>",
    "  --lease-id <UUID>",
    "  --lease-expires-at <RFC3339 UTC instant>",
    "  --curve-repo <exact clean Curve origin/main checkout>",
    "  --target-repo <exact target checkout>",
    "  [--project-owner faocampo]",
  ].join(" ");
}

function parseArguments(argv) {
  const result = {
    packetId: null,
    authorizationId: null,
    authorizationVersion: null,
    attemptId: null,
    leaseId: null,
    leaseExpiresAt: null,
    curveRepository: null,
    targetRepository: null,
    projectOwner: "faocampo",
  };
  const mappings = new Map([
    ["--packet-id", "packetId"],
    ["--authorization-id", "authorizationId"],
    ["--authorization-version", "authorizationVersion"],
    ["--attempt-id", "attemptId"],
    ["--lease-id", "leaseId"],
    ["--lease-expires-at", "leaseExpiresAt"],
    ["--curve-repo", "curveRepository"],
    ["--target-repo", "targetRepository"],
    ["--project-owner", "projectOwner"],
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const key = mappings.get(argument);
    if (!key || index + 1 >= argv.length) throw new Error(usage());
    if (result[key] !== null && key !== "projectOwner") {
      throw new Error(`${argument} may be supplied only once`);
    }
    result[key] = argv[index + 1];
    index += 1;
  }
  if (
    !result.packetId ||
    !result.authorizationId ||
    !result.authorizationVersion ||
    !result.attemptId ||
    !result.leaseId ||
    !result.leaseExpiresAt ||
    !result.curveRepository ||
    !result.targetRepository
  ) {
    throw new Error(usage());
  }
  if (!/^CURVE-[A-Z0-9]+(?:-[A-Z0-9]+)*$/u.test(result.packetId)) {
    throw new Error("--packet-id must be a canonical Curve packet ID");
  }
  if (!/^CURVE-AUTH-[A-Z0-9]+(?:-[A-Z0-9]+)*$/u.test(result.authorizationId)) {
    throw new Error("--authorization-id must be a canonical Curve authorization ID");
  }
  result.authorizationVersion = Number(result.authorizationVersion);
  if (!Number.isInteger(result.authorizationVersion) || result.authorizationVersion < 1) {
    throw new Error("--authorization-version must be a positive integer");
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(result.attemptId)) {
    throw new Error("--attempt-id must be a UUID");
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(result.leaseId)) {
    throw new Error("--lease-id must be a UUID");
  }
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(result.leaseExpiresAt) ||
    !Number.isFinite(Date.parse(result.leaseExpiresAt))
  ) {
    throw new Error("--lease-expires-at must be an RFC 3339 UTC instant");
  }
  if (!/^[A-Za-z0-9_.-]+$/u.test(result.projectOwner)) {
    throw new Error("--project-owner contains an unsupported character");
  }
  result.curveRepository = resolve(result.curveRepository);
  result.targetRepository = resolve(result.targetRepository);
  return result;
}

parseArguments(process.argv.slice(2));
throw new Error(
  "standalone authorization is blocked: a reviewed Curve control-plane integration must supply the trusted human-authority verifier and durable single-consumption attempt-lease provider",
);
