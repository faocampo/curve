import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../../", import.meta.url));
const importRoot = join(root, "contracts/recovered/plane-7d4225d");
const sourceCommit = "7d4225d594adf984de1451f16ad2c8ab741c58eb";
const sourcePrefix = "apps/api/plane/curve/";
const provenanceDigest = "d9502ecb1a8cdcc4ea68973891657e61613b48d6705942e941b91aa3f51d2f3a";
const supplementalDigest = "cac4c9a2020147611c723638fec747083409a020c1887dbb5a924077fe832e0d";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const read = (path) => readFileSync(join(importRoot, path));
const readJson = (path) => JSON.parse(read(path));
const provenance = readJson("PROVENANCE.json");
const supplemental = readJson("supplemental-provenance.json");
const importRecord = readJson("IMPORT.json");
const metadataPaths = ["IMPORT.json", "PROVENANCE.json", "README.md", "supplemental-provenance.json"];
const familyCounts = {
  project_association_candidate: 5,
  project_association_read_candidate: 3,
  scope_proposal_candidate: 5,
  scope_reopening_candidate: 7,
  scope_reopening_read_candidate: 3,
  scoped_prd_candidate: 11,
};
const proofDigests = {
  "scope_reopening_qualification.json": "72bdb3b987ec1925754e6a14dee36cecec3c85706605c052d443628d84e7fb52",
  "project_association_read_qualification.json": "5381243df882c087ab61932cda77e286a76b3b3e4b19853be5eea9cc81574f1b",
};

function filesUnder(directory, prefix = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${prefix}${entry.name}`;
    assert.ok(entry.isDirectory() || entry.isFile(), `${path}: only ordinary files and directories are allowed`);
    return entry.isDirectory() ? filesUnder(join(directory, entry.name), `${path}/`) : [path];
  }).sort();
}

function checkBytes(inventory, readBytes = read) {
  for (const [path, entry] of Object.entries(inventory)) {
    assert.deepEqual(Object.keys(entry).sort(), ["original_commit", "original_path", "original_repository", "sha256"]);
    assert.equal(entry.original_repository, "faocampo/plane");
    assert.equal(entry.original_commit, sourceCommit);
    assert.equal(entry.original_path, `${sourcePrefix}${path}`);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    assert.equal(hash(readBytes(path)), entry.sha256, `${path}: original source bytes changed`);
  }
}

function checkInventory(paths) {
  assert.deepEqual(paths.toSorted(), [
    ...Object.keys(provenance), ...Object.keys(supplemental), ...metadataPaths,
  ].sort(), "recovered tree must have no extra or missing files");
}

function* objects(value) {
  if (!value || typeof value !== "object") return;
  yield value;
  for (const child of Object.values(value)) yield* objects(child);
}

test("original recovery provenance stays byte-identical and binds all 45 original inputs", () => {
  assert.equal(hash(read("PROVENANCE.json")), provenanceDigest);
  assert.equal(Object.keys(provenance).length, 45);
  checkBytes(provenance);
});

test("five supplemental historical sources have separate exact origin pins", () => {
  assert.equal(hash(read("supplemental-provenance.json")), supplementalDigest);
  assert.deepEqual(Object.keys(supplemental).sort(), [
    "tests/test_scoped_prd_bridge.py",
    "tests/test_scoped_prd_integrity.py",
    "tests/test_scoped_prd_races.py",
    "tests/test_scoped_prd_temporal.py",
    "tests/test_scoped_prd_views.py",
  ]);
  assert.ok(Object.keys(supplemental).every((path) => !Object.hasOwn(provenance, path)));
  checkBytes(supplemental);
});

test("new import metadata identifies actual Plane source without restoring missing history or authority", () => {
  assert.deepEqual(importRecord, {
    schema_version: "curve.recovered-source-import/v1",
    status: "RECOVERED_CONSUMER_MIRRORS_NEW_CURVE_IMPORT",
    source_repository: "faocampo/plane",
    source_commit: sourceCommit,
    source_path_prefix: sourcePrefix,
    original_input_count: 45,
    supplemental_source_count: 5,
    original_provenance: { path: "PROVENANCE.json", sha256: provenanceDigest },
    supplemental_provenance: { path: "supplemental-provenance.json", sha256: supplementalDigest },
    source_bytes_preserved: true,
    missing_curve_history_restored: false,
    historical_verification_rerun: false,
    execution_authority: "NONE",
    runtime_activation: false,
    unavailable_later_contracts: [
      "ORIGINAL_LATER_CURVE_CONTRACTS", "MANUAL_DRAFT_PLAN", "NATIVE_SCOPE_READ", "GATE_2_MANUAL_CONTROL",
    ],
    retained_qualification_sha256: proofDigests,
  });
});

test("the recovered tree contains exactly the two source inventories and declared import metadata", () => {
  checkInventory(filesUnder(importRoot));
});

test("all six original candidate families and source file kinds remain present", () => {
  const paths = Object.keys(provenance);
  const directories = [...new Set(paths.filter((path) => path.includes("/")).map((path) => path.split("/")[0]))].sort();
  assert.deepEqual(directories, Object.keys(familyCounts).sort());
  for (const [family, count] of Object.entries(familyCounts)) {
    assert.equal(paths.filter((path) => path.startsWith(`${family}/`)).length, count, family);
  }
  assert.equal(paths.filter((path) => path.endsWith(".schema.json")).length, 22);
  assert.equal(paths.filter((path) => path.endsWith("/policy-v1.json")).length, 6);
  assert.equal(paths.filter((path) => path.endsWith("/manifest-v1.json")).length, 5);
  assert.equal(paths.filter((path) => path.endsWith(".md")).length, 9);
  assert.equal(paths.filter((path) => path.endsWith("_qualification.json")).length, 2);
  assert.ok(paths.includes("scope_reopening_candidate/pre-plan-baseline-v1.json"));
  for (const path of filesUnder(importRoot).filter((path) => path.endsWith(".json"))) readJson(path);
});

test("original raw manifest maps resolve with exactly their historical membership and hashes", () => {
  for (const family of Object.keys(familyCounts).filter((name) => name !== "project_association_candidate")) {
    const manifest = readJson(`${family}/manifest-v1.json`);
    const expected = Object.keys(provenance)
      .filter((path) => path.startsWith(`${family}/`) && !path.endsWith("/manifest-v1.json"))
      .filter((path) => family !== "scope_proposal_candidate" || path.endsWith(".schema.json"))
      .map((path) => path.slice(family.length + 1)).sort();
    assert.deepEqual(Object.keys(manifest).sort(), expected, family);
    for (const [name, digest] of Object.entries(manifest)) {
      assert.match(digest, /^sha256:[a-f0-9]{64}$/);
      assert.equal(digest, `sha256:${hash(read(`${family}/${name}`))}`);
      assert.equal(digest, `sha256:${provenance[`${family}/${name}`].sha256}`);
    }
  }
  assert.ok(!Object.hasOwn(provenance, "project_association_candidate/manifest-v1.json"));
});

test("both original qualification proof hashes and the bounded successor relationship remain intact", () => {
  for (const [path, digest] of Object.entries(proofDigests)) assert.equal(hash(read(path)), digest, path);
  const predecessor = readJson("scope_reopening_qualification.json");
  const successor = readJson("project_association_read_qualification.json");
  assert.equal(successor.predecessor_digest, `sha256:${proofDigests["scope_reopening_qualification.json"]}`);
  assert.equal(successor.read_edition, "LOCAL_NATIVE_PROJECT_ASSOCIATION_PRECONDITION_READ_V1");
  for (const key of Object.keys(predecessor).filter((key) => key !== "runtime_sources")) {
    assert.deepEqual(successor.qualification[key], predecessor[key], key);
  }
  assert.equal(predecessor.models.length, 31);
  assert.equal(Object.keys(predecessor.migration_digests).length, 23);
  assert.equal(Object.keys(predecessor.runtime_sources).length, 120);
  assert.equal(Object.keys(successor.qualification.runtime_sources).length, 122);
  assert.deepEqual(Object.keys(successor.qualification.runtime_sources)
    .filter((path) => !Object.hasOwn(predecessor.runtime_sources, path)).sort(), [
    "project_association_read.py", "project_association_read_views.py",
  ]);
  assert.deepEqual(Object.keys(predecessor.runtime_sources)
    .filter((path) => predecessor.runtime_sources[path] !== successor.qualification.runtime_sources[path]), ["urls.py"]);
  assert.deepEqual(predecessor.excluded_writers, [
    "PLAN_APPROVAL", "CONTROLLING_WORK_BINDING", "EXECUTION", "COMPLETION_CREDIT",
  ]);
});

test("recovered schema IDs are unique across Curve and available references resolve without interpretation", () => {
  const contractsRoot = join(root, "contracts");
  const ids = new Map();
  for (const path of filesUnder(contractsRoot).filter((path) => path.endsWith(".schema.json"))) {
    const schema = JSON.parse(readFileSync(join(contractsRoot, path)));
    assert.equal(typeof schema.$id, "string", path);
    assert.ok(!ids.has(schema.$id), `duplicate schema ID: ${schema.$id}`);
    ids.set(schema.$id, schema);
  }
  let references = 0;
  for (const path of Object.keys(provenance).filter((path) => path.endsWith(".schema.json"))) {
    const schema = readJson(path);
    assert.match(schema.$id, /^https:\/\/curve\.example\.invalid\/candidates\//);
    for (const object of objects(schema)) {
      if (!Object.hasOwn(object, "$ref")) continue;
      references++;
      const url = new URL(object.$ref, schema.$id);
      const fragment = url.hash;
      url.hash = "";
      assert.ok(ids.has(url.href), `${path}: unresolved schema ${object.$ref}`);
      if (fragment) {
        assert.ok(fragment.startsWith("#/"), `${path}: unsupported reference fragment`);
        let target = ids.get(url.href);
        for (const token of fragment.slice(2).split("/")) {
          const key = decodeURIComponent(token).replaceAll("~1", "/").replaceAll("~0", "~");
          assert.ok(target && Object.hasOwn(target, key), `${path}: unresolved pointer ${object.$ref}`);
          target = target[key];
        }
      }
    }
  }
  assert.equal(references, 1, "retain the one original cross-schema reference");
});

test("historical relative document links resolve to provenance-bound evidence inside the import", () => {
  const sourcePaths = new Set([...Object.keys(provenance), ...Object.keys(supplemental)]);
  let supplementalLinks = 0;
  for (const path of Object.keys(provenance).filter((path) => path.endsWith(".md"))) {
    for (const match of read(path).toString("utf8").matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split("#", 1)[0];
      if (!target || /^(https?:|mailto:)/.test(target)) continue;
      const absolute = resolve(importRoot, dirname(path), decodeURIComponent(target));
      const source = [...sourcePaths].find((candidate) => join(importRoot, candidate) === absolute);
      assert.ok(source, `${path}: unpinned historical link ${target}`);
      if (Object.hasOwn(supplemental, source)) supplementalLinks++;
    }
  }
  assert.equal(supplementalLinks, 5);
});

test("integrity checks reject changed bytes and extra or missing source files", () => {
  assert.throws(() => checkBytes(provenance, () => Buffer.from("{}\n")), /original source bytes changed/);
  const paths = filesUnder(importRoot);
  assert.throws(() => checkInventory([...paths, "unexpected.json"]), /no extra or missing files/);
  assert.throws(() => checkInventory(paths.filter((path) => path !== "scope_reopening_qualification.json")), /no extra or missing files/);
});
