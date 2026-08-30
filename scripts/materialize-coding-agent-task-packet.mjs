#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  createGitEvidenceResolver,
  createGitHubProjectItemResolver,
  createLocalCodingAgentToolResolver,
  discoverCodingAgentTaskPacketFiles,
  validateCodingAgentRegistryFilesPreflight,
  validateCodingAgentTaskPacketForReadinessPreflight,
  validateCodingAgentTaskPacketSetSemantics,
} from "./lib/coding-agent-task-packet.mjs";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptRoot, "..");
const packetRegistryRoot = resolve(repositoryRoot, "contracts/task-packets");

function usage() {
  return [
    "usage: materialize-coding-agent-task-packet.mjs",
    "  --packet-id CURVE-<ID>",
    "  --target-repo <exact target checkout>",
    "  [--project-owner faocampo]",
  ].join(" ");
}

function parseArguments(argv) {
  const result = {
    packetId: null,
    targetRepository: null,
    projectOwner: "faocampo",
  };
  const mappings = new Map([
    ["--packet-id", "packetId"],
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
  if (!result.packetId || !result.targetRepository) {
    throw new Error(usage());
  }
  if (!/^CURVE-[A-Z0-9]+(?:-[A-Z0-9]+)*$/u.test(result.packetId)) {
    throw new Error("--packet-id must be a canonical Curve packet ID");
  }
  if (!/^[A-Za-z0-9_.-]+$/u.test(result.projectOwner)) {
    throw new Error("--project-owner contains an unsupported character");
  }
  result.targetRepository = resolve(result.targetRepository);
  return result;
}

function validateSchema(path) {
  try {
    execFileSync(
      resolve(repositoryRoot, "node_modules/.bin/ajv"),
      [
        "validate",
        "--spec=draft2020",
        "--strict=false",
        "-c",
        "ajv-formats",
        "-s",
        resolve(
          repositoryRoot,
          "contracts/schemas/coding-agent-task-packet.schema.json",
        ),
        "-d",
        path,
      ],
      { cwd: repositoryRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.stdout?.toString().trim();
    throw new Error(
      `task packet ${relative(repositoryRoot, path)} failed schema validation${
        detail ? `: ${detail}` : ""
      }`,
    );
  }
}

const args = parseArguments(process.argv.slice(2));
const packetPaths = discoverCodingAgentTaskPacketFiles(packetRegistryRoot);
if (packetPaths.length === 0) {
  throw new Error(
    "the canonical contracts/task-packets registry is empty; arbitrary --packet paths are not accepted",
  );
}

for (const path of packetPaths) validateSchema(path);
const packets = packetPaths.map((path) => JSON.parse(readFileSync(path, "utf8")));
validateCodingAgentTaskPacketSetSemantics(packets);
const registry = validateCodingAgentRegistryFilesPreflight(
  packets,
  packetPaths,
  repositoryRoot,
);

const matchingIndexes = packets
  .map((packet, index) => ({ packet, index }))
  .filter(({ packet }) => packet.packet_id === args.packetId);
if (matchingIndexes.length !== 1) {
  throw new Error(
    `--packet-id ${args.packetId} resolved ${matchingIndexes.length} records in the canonical registry`,
  );
}
const [{ packet, index }] = matchingIndexes;

const resolveReference = createGitEvidenceResolver({
  CURVE: repositoryRoot,
  TARGET: args.targetRepository,
});
const resolveProjectItem = createGitHubProjectItemResolver({
  owner: args.projectOwner,
});
const result = validateCodingAgentTaskPacketForReadinessPreflight(packet, {
  resolveReference,
  resolveProjectItem,
  curveRepository: repositoryRoot,
  targetRepository: args.targetRepository,
  resolveTool: createLocalCodingAgentToolResolver(),
});

process.stdout.write(
  `${JSON.stringify(
    {
      readiness_preflight: "PASSED_WITH_IMPLEMENTATION_AUTHORITY_REQUIRED",
      implementation_authority_granted: false,
      registry_packet_count: packets.length,
      registry_revision: registry.registryPublicationRevision,
      selected_packet: {
        packet_id: packet.packet_id,
        packet_path: relative(repositoryRoot, packetPaths[index]),
        ...result,
      },
    },
    null,
    2,
  )}\n`,
);
