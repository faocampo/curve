import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";

const root = process.cwd();
const markdownRoots = [join(root, "docs"), join(root, "contracts")];

function filesUnder(directory, suffix) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path, suffix) : path.endsWith(suffix) ? [path] : [];
  });
}

const markdownFiles = markdownRoots.flatMap((path) => filesUnder(path, ".md")).sort();
const failures = [];
const diagrams = [];

for (const file of markdownFiles) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  let previousHeading = 0;
  let inFence = false;
  let mermaidStart = -1;
  let mermaid = [];

  lines.forEach((line, index) => {
    if (line.startsWith("```")) {
      if (!inFence) {
        inFence = true;
        if (line.trim() === "```mermaid") {
          mermaidStart = index + 1;
          mermaid = [];
        }
      } else {
        if (mermaidStart >= 0) {
          diagrams.push({ file, line: mermaidStart, source: mermaid.join("\n") });
          mermaidStart = -1;
          mermaid = [];
        }
        inFence = false;
      }
      return;
    }
    if (mermaidStart >= 0) mermaid.push(line);
    if (inFence) return;

    const heading = /^(#{1,6})\s+\S/.exec(line);
    if (heading) {
      const level = heading[1].length;
      if (previousHeading && level > previousHeading + 1) {
        failures.push(`${relative(root, file)}:${index + 1}: heading jumps H${previousHeading} to H${level}`);
      }
      previousHeading = level;
    }

    for (const match of line.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const raw = match[1].trim().replace(/^<|>$/g, "");
      if (!raw || /^(https?:|mailto:|#)/.test(raw)) continue;
      const target = raw.split("#", 1)[0];
      if (!target) continue;
      const resolved = normalize(resolve(dirname(file), decodeURIComponent(target)));
      if (!existsSync(resolved)) failures.push(`${relative(root, file)}:${index + 1}: missing local link ${raw}`);
    }
  });

  if (inFence) failures.push(`${relative(root, file)}: unclosed fenced code block`);
}

const laterPacketCatalogPath = join(root, "docs/technical/m1-m7-task-packets.md");
const laterPacketCatalog = readFileSync(laterPacketCatalogPath, "utf8");
const onyxDecisionPacketPath = join(
  root,
  "docs/technical/d002-onyx-delegated-identity-decision-packet.md",
);
const onyxDecisionPacket = readFileSync(onyxDecisionPacketPath, "utf8");
const m1TaskPacketPath = join(root, "docs/technical/m1-alignment-evidence-prd-task-packet.md");
const m1TaskPacket = readFileSync(m1TaskPacketPath, "utf8");
const m1ProductPacketPath = join(root, "docs/technical/m1-00a-product-core-task-packet.md");
const m1ProductPacket = readFileSync(m1ProductPacketPath, "utf8");

function requireDocumentTokens(documentPath, document, tokens) {
  for (const token of tokens) {
    if (!document.includes(token)) {
      failures.push(`${relative(root, documentPath)}: missing required contract token ${token}`);
    }
  }
}

requireDocumentTokens(onyxDecisionPacketPath, onyxDecisionPacket, [
  "# D-002 Onyx Delegated-Identity Decision Packet",
  "`PROPOSED`; evidence-ready decision packet; no Onyx activation authority",
  "## Verified upstream boundary",
  "https://docs.onyx.app/developers/overview",
  "https://docs.onyx.app/deployment/authentication/oidc",
  "## Bounded proof plan",
  "## Decision outcome template",
]);

const expectedM1SliceIds = [
  "M1-00A",
  "M1-01A",
  "M1-01B",
  "M1-02A",
  "M1-02B",
  "M1-03A",
  "M1-03B",
  "M1-04A",
  "M1-04B",
  "M1-05A",
  "M1-05B",
  "M1-06A",
  "M1-06B",
  "M1-06C",
  "M1-07A",
  "M1-07B",
];
requireDocumentTokens(m1TaskPacketPath, m1TaskPacket, [
  "# M1 Alignment, Evidence, and PRD Task Packet",
  "`PREPARED_NOT_DISPATCHABLE`",
  "## Delivery lanes",
  "| Manual-first |",
  "| Delegated knowledge |",
  "| Model-assisted |",
  "## Normative contract set to publish before dispatch",
  "## Dispatch readiness matrix",
  ...expectedM1SliceIds.map((sliceId) => `| ${sliceId} (`),
]);
requireDocumentTokens(m1ProductPacketPath, m1ProductPacket, [
  "# M1-00A Minimal Product Core Task Packet",
  "`PREPARED_NOT_DISPATCHABLE`",
  "## Approved outcome",
  "## Authorization matrix",
  "## Given/When/Then acceptance cases",
  "| P-18 |",
  "## Dispatch blockers",
]);
const expectedLaterPacketIds = [
  "M1-00A",
  ...Array.from({ length: 7 }, (_, index) => `M1-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `M2-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `M3-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `M4-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 14 }, (_, index) => `M5-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 5 }, (_, index) => `M6-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 5 }, (_, index) => `M7-${String(index + 1).padStart(2, "0")}`),
];
const laterPacketRowIds = Array.from(
  laterPacketCatalog.matchAll(/^\| (M[1-7]-\d{2}[A-Z]?)(?: [^|]*)? \|/gm),
  (match) => match[1],
);
const laterPacketRows = laterPacketCatalog
  .split(/\r?\n/)
  .filter((line) => /^\| M[1-7]-\d{2}[A-Z]?/.test(line));
for (const row of laterPacketRows) {
  if (!/^\| M[1-7]-\d{2}[A-Z]? \([^)]+\) \|/.test(row)) {
    failures.push(
      "docs/technical/m1-m7-task-packets.md: every packet row must place its short description in parentheses immediately after the identifier",
    );
  }
}
if (/\bD-\d{3}\b(?! \()/m.test(laterPacketCatalog)) {
  failures.push(
    "docs/technical/m1-m7-task-packets.md: every decision identifier must be followed immediately by a parenthetical description",
  );
}
for (const packetId of expectedLaterPacketIds) {
  const count = laterPacketRowIds.filter((candidate) => candidate === packetId).length;
  if (count !== 2) {
    failures.push(
      `docs/technical/m1-m7-task-packets.md: ${packetId} must have one outcome row and one dependency/trace row; found ${count}`,
    );
  }
}
for (const packetId of new Set(laterPacketRowIds)) {
  if (!expectedLaterPacketIds.includes(packetId)) {
    failures.push(`docs/technical/m1-m7-task-packets.md: unexpected packet row ${packetId}`);
  }
}
if (/^\| M[1-7]-\d{2}-M[1-7]-\d{2}/m.test(laterPacketCatalog)) {
  failures.push(
    "docs/technical/m1-m7-task-packets.md: grouped dispatch rows are prohibited; use one repository-local packet per row",
  );
}
for (const packetId of expectedLaterPacketIds.filter((packetId) => packetId.startsWith("M7-"))) {
  const traceRow = laterPacketCatalog
    .split(/\r?\n/)
    .find((line) => line.startsWith(`| ${packetId} `) && line.includes("OPEN:"));
  if (!traceRow || !traceRow.includes("post-R1 extension decision must add exact FR/NFR/AC")) {
    failures.push(
      `docs/technical/m1-m7-task-packets.md: ${packetId} must retain its explicit post-R1 product-trace decision gate`,
    );
  }
}

const temporary = mkdtempSync(join(tmpdir(), "curve-mermaid-"));
try {
  const puppeteerConfig = join(temporary, "puppeteer-config.json");
  if (process.env.CI === "true") {
    writeFileSync(
      puppeteerConfig,
      `${JSON.stringify({ args: ["--no-sandbox", "--disable-setuid-sandbox"] }, null, 2)}\n`,
    );
  }

  diagrams.forEach((diagram, index) => {
    const input = join(temporary, `${index}.mmd`);
    const output = join(temporary, `${index}.svg`);
    writeFileSync(input, `${diagram.source}\n`);
    try {
      const args = ["--quiet", "--input", input, "--output", output];
      if (process.env.CI === "true") args.push("--puppeteerConfigFile", puppeteerConfig);
      execFileSync(join(root, "node_modules/.bin/mmdc"), args, { stdio: "pipe" });
    } catch (error) {
      const detail = error.stderr?.toString().trim() || error.message;
      failures.push(`${relative(root, diagram.file)}:${diagram.line}: invalid Mermaid: ${detail}`);
    }
  });
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${markdownFiles.length} Markdown files and ${diagrams.length} Mermaid diagrams.`);
