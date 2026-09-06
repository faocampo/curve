import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { auditDocumentation } from "../lib/documentation-audit.mjs";

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), "curve-doc-audit-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, body] of Object.entries(files)) writeFileSync(join(root, name), body);
  return root;
}

test("audits root instructions and duplicate heading anchors", (t) => {
  const files = { "AGENTS.md": "[guide](guide.md#repeated-1)\n", "guide.md": "# Repeated\n\n# Repeated\n" };
  const result = auditDocumentation(fixture(t, files), Object.keys(files));
  assert.equal(result.files.length, 2);
  assert.deepEqual(result.findings, []);
});

test("reports broken links, fragments, imports and JSON", (t) => {
  const files = { "README.md": "[missing](absent.md)\n[anchor](#absent)\n", "bad.json": "{", "bad.mjs": 'import x from "./absent.mjs";\n' };
  const result = auditDocumentation(fixture(t, files), Object.keys(files));
  assert.deepEqual(result.findings.map((f) => f.rule).sort(), ["invalid-json", "missing-anchor", "missing-import", "missing-link"]);
});

test("ignores fenced examples and remote links, rejects outside paths", (t) => {
  const files = { "README.md": "```md\n[example](absent.md)\n```\n[remote](https://example.test)\n[outside](../outside.md)\n" };
  const result = auditDocumentation(fixture(t, files), ["README.md", "../outside.md"]);
  assert.deepEqual(result.findings.map((f) => f.rule).sort(), ["missing-or-outside-file", "outside-link"]);
});

test("current handoff preserves activation and unresolved Gate 2 boundaries", () => {
  const document = (name) => readFileSync(new URL(`../../docs/technical/${name}`, import.meta.url), "utf8");
  assert.match(document("coding-handoff.md"), /D-012 is the M5 Docusaurus delivery profile/);
  assert.match(document("pending-stages.md"), /currently requires D-014 at Gate 2/);
  assert.match(document("coding-handoff.md"), /Baseline approval and\s+operational activation are separate checks/);
  assert.doesNotMatch(document("m1-external-prd-checkpoints.md"), /runtime API is still unimplemented/);
});

test("CLI validates inline JavaScript without executing prototype code", (t) => {
  const root = fixture(t, {
    "prototype.html": '<script>throw new Error("must never execute");</script><script>const = ;</script><script type="application/json">{}</script>',
  });
  execFileSync("git", ["init", "--quiet"], { cwd: root });
  const result = spawnSync(process.execPath, [fileURLToPath(new URL("../audit-documentation.mjs", import.meta.url)), "--json"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.deepEqual(JSON.parse(result.stdout).findings.map((f) => f.rule), ["inline-javascript-syntax"]);
});
