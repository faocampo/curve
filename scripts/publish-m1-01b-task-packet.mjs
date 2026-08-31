#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

import {
  buildM1_01BAuthorityRecords,
  buildM1_01BContextManifest,
  buildM1_01BPublishedPacket,
  buildM1_01BSourceCatalog,
  buildM1_01BStateRecords,
  M1_01B_CONTEXT_PATH,
  M1_01B_PACKET_PATH,
  M1_01B_REPOSITORY_ROOT,
  M1_01B_SOURCE_CATALOG_PATH,
} from "./lib/m1-01b-publication.mjs";

function usage() {
  return [
    "usage: publish-m1-01b-task-packet.mjs",
    "  e1 --s <normative revision>",
    "  e2 --s <normative revision> --e1 <authority revision>",
    "  c --s <normative revision> --e1 <authority revision> --e2 <evidence revision>",
    "  p --s <normative revision> --e1 <authority revision> --e2 <evidence revision> --c <catalog revision>",
  ].join("\n");
}

function parseArguments(argv) {
  const [stage, ...rest] = argv;
  if (!new Set(["e1", "e2", "c", "p"]).has(stage)) throw new Error(usage());
  const result = { stage, s: null, e1: null, e2: null, c: null };
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index]?.replace(/^--/u, "");
    const value = rest[index + 1];
    if (!Object.hasOwn(result, key) || key === "stage" || !value || result[key]) {
      throw new Error(usage());
    }
    result[key] = value;
  }
  const required = {
    e1: ["s"],
    e2: ["s", "e1"],
    c: ["s", "e1", "e2"],
    p: ["s", "e1", "e2", "c"],
  }[stage];
  if (required.some((key) => !/^[0-9a-f]{40}$/u.test(result[key] ?? ""))) {
    throw new Error(usage());
  }
  return result;
}

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: M1_01B_REPOSITORY_ROOT,
    encoding: "utf8",
    ...options,
  }).trim();
}

function requireCleanHead(expected) {
  const head = git(["rev-parse", "HEAD"]);
  if (head !== expected) throw new Error(`expected clean HEAD ${expected}, got ${head}`);
  if (git(["status", "--porcelain=v1", "--untracked-files=all"]) !== "") {
    throw new Error("publication stage requires a clean worktree");
  }
}

function requireAncestor(ancestor, descendant, label) {
  try {
    git(["merge-base", "--is-ancestor", ancestor, descendant]);
  } catch {
    throw new Error(`${label} requires ${ancestor} to precede ${descendant}`);
  }
}

function writeJson(path, value) {
  const absolute = join(M1_01B_REPOSITORY_ROOT, path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`);
}

export function publishM1_01BStage(args) {
  if (args.stage === "e1") {
    requireCleanHead(args.s);
    for (const artifact of buildM1_01BAuthorityRecords(args.s)) {
      writeJson(artifact.path, artifact.value);
    }
    return;
  }
  if (args.stage === "e2") {
    requireCleanHead(args.e1);
    requireAncestor(args.s, args.e1, "S -> E1");
    for (const artifact of buildM1_01BStateRecords(args.s, args.e1)) {
      writeJson(artifact.path, artifact.value);
    }
    writeJson(M1_01B_CONTEXT_PATH, buildM1_01BContextManifest(args.s));
    return;
  }
  if (args.stage === "c") {
    requireCleanHead(args.e2);
    requireAncestor(args.s, args.e1, "S -> E1");
    requireAncestor(args.e1, args.e2, "E1 -> E2");
    writeJson(
      M1_01B_SOURCE_CATALOG_PATH,
      buildM1_01BSourceCatalog(args.s, args.e2),
    );
    return;
  }
  requireCleanHead(args.c);
  requireAncestor(args.s, args.e1, "S -> E1");
  requireAncestor(args.e1, args.e2, "E1 -> E2");
  requireAncestor(args.e2, args.c, "E2 -> C");
  writeJson(
    M1_01B_PACKET_PATH,
    buildM1_01BPublishedPacket(args.s, args.e2, args.c),
  );
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  publishM1_01BStage(parseArguments(process.argv.slice(2)));
}
