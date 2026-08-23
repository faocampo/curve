import { createHash } from "node:crypto";

export const EXPECTED_ACCEPTANCE_CRITERIA = Array.from(
  { length: 60 },
  (_, index) => `AC-${String(index + 1).padStart(2, "0")}`,
);

export function extractPrdAcceptanceCriteria(prdText, sectionTitle) {
  const sectionStart = prdText.indexOf(`## ${sectionTitle}`);
  if (sectionStart === -1) {
    throw new Error(`Cannot resolve PRD section: ${sectionTitle}`);
  }
  const nextSection = prdText.indexOf("\n## ", sectionStart + 4);
  const section = prdText.slice(sectionStart, nextSection === -1 ? prdText.length : nextSection);
  return [...section.matchAll(/^\| (AC-\d{2}) \| (.*) \|$/gm)].map(
    ([, id, criterion]) => ({ id, criterion }),
  );
}

export function acceptanceCriteriaDigest(criteria) {
  const hash = createHash("sha256");
  hash.update("curve-prd-acceptance-criteria:v1\0");
  for (const { id, criterion } of criteria) {
    hash.update(id);
    hash.update("\0");
    hash.update(criterion);
    hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

function uniqueCatalog(catalog, name) {
  const identifiers = catalog.map((entry) => entry.id);
  if (new Set(identifiers).size !== identifiers.length) {
    throw new Error(`Test strategy contains duplicate ${name} identifiers`);
  }
  return new Map(catalog.map((entry) => [entry.id, entry]));
}

function expandAcceptanceCriteria(text) {
  const criteria = new Set();
  for (const match of text.matchAll(/AC-(\d{2})(?:-AC-(\d{2}))?/g)) {
    const first = Number(match[1]);
    const last = Number(match[2] ?? match[1]);
    for (let value = first; value <= last; value += 1) {
      criteria.add(`AC-${String(value).padStart(2, "0")}`);
    }
  }
  return criteria;
}

export function extractDevelopmentPlanPackageTrace(developmentPlanText) {
  const packages = new Map();
  for (const line of developmentPlanText.split("\n")) {
    if (!/^\| (?:P0|M[0-7]|R1)-\d{2} \|/.test(line)) continue;
    const cells = line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());
    const packageId = cells[0];
    if (packages.has(packageId)) {
      throw new Error(`Development plan contains duplicate package row ${packageId}`);
    }
    packages.set(packageId, expandAcceptanceCriteria(line));
  }
  return packages;
}

function assertOrderedAcceptanceCriteria(actual, label) {
  if (JSON.stringify(actual) !== JSON.stringify(EXPECTED_ACCEPTANCE_CRITERIA)) {
    throw new Error(`${label} must contain each ordered AC-01 through AC-60 exactly once`);
  }
}

export function validateTestStrategyMatrixSemantics({ matrix, prdText, developmentPlanText }) {
  const prdCriteria = extractPrdAcceptanceCriteria(prdText, matrix.source.section);
  assertOrderedAcceptanceCriteria(
    prdCriteria.map(({ id }) => id),
    "PRD acceptance section",
  );

  const calculatedDigest = acceptanceCriteriaDigest(prdCriteria);
  if (matrix.source.acceptance_criteria_digest !== calculatedDigest) {
    throw new Error(
      `Test strategy PRD acceptance-criteria digest mismatch: expected ${calculatedDigest}`,
    );
  }

  const suites = uniqueCatalog(matrix.suites, "suite");
  const environments = uniqueCatalog(matrix.environments, "environment");
  const commands = uniqueCatalog(matrix.commands, "command");
  const packageTrace = extractDevelopmentPlanPackageTrace(developmentPlanText);
  assertOrderedAcceptanceCriteria(
    matrix.acceptance_criteria.map((entry) => entry.ac_id),
    "Test strategy matrix",
  );

  for (const suite of matrix.suites) {
    for (const commandId of suite.command_ids) {
      const command = commands.get(commandId);
      if (!command) {
        throw new Error(`Suite ${suite.id} references unknown command ${commandId}`);
      }
      if (!suite.repositories.includes(command.repository)) {
        throw new Error(
          `Suite ${suite.id} command ${commandId} belongs to undeclared repository ${command.repository}`,
        );
      }
    }
  }

  for (const criterion of matrix.acceptance_criteria) {
    const owningTrace = packageTrace.get(criterion.owning_package);
    if (!owningTrace) {
      throw new Error(
        `${criterion.ac_id} references owning package ${criterion.owning_package} absent from the development plan`,
      );
    }
    if (!owningTrace.has(criterion.ac_id)) {
      throw new Error(
        `${criterion.ac_id} is absent from development-plan trace for owning package ${criterion.owning_package}`,
      );
    }

    const owningMilestone = criterion.owning_package.split("-")[0];
    if (criterion.milestone !== owningMilestone) {
      throw new Error(
        `${criterion.ac_id} milestone ${criterion.milestone} differs from owning package ${criterion.owning_package}`,
      );
    }

    const primarySuite = suites.get(criterion.primary_suite);
    if (!primarySuite) {
      throw new Error(`${criterion.ac_id} references unknown primary suite ${criterion.primary_suite}`);
    }
    if (criterion.supporting_suites.includes(criterion.primary_suite)) {
      throw new Error(`${criterion.ac_id} repeats its primary suite as supporting evidence`);
    }
    const referencedSuites = [
      primarySuite,
      ...criterion.supporting_suites.map((suiteId) => {
        const suite = suites.get(suiteId);
        if (!suite) {
          throw new Error(`${criterion.ac_id} references unknown supporting suite ${suiteId}`);
        }
        return suite;
      }),
    ];

    const environment = environments.get(criterion.environment);
    if (!environment) {
      throw new Error(`${criterion.ac_id} references unknown environment ${criterion.environment}`);
    }
    const suiteCommandIds = new Set(referencedSuites.flatMap((suite) => suite.command_ids));
    const criterionCommands = criterion.command_ids.map((commandId) => {
      const command = commands.get(commandId);
      if (!command) {
        throw new Error(`${criterion.ac_id} references unknown command ${commandId}`);
      }
      if (!suiteCommandIds.has(commandId)) {
        throw new Error(`${criterion.ac_id} command ${commandId} is not owned by a referenced suite`);
      }
      return command;
    });

    if (
      criterion.coverage_state === "ENVIRONMENT_BLOCKED" &&
      environment.availability === "AVAILABLE"
    ) {
      throw new Error(
        `${criterion.ac_id} claims an environment block in available ${environment.id}`,
      );
    }
    if (
      criterion.coverage_state === "PARTIAL" &&
      !criterionCommands.some((command) => command.state === "AVAILABLE")
    ) {
      throw new Error(
        `${criterion.ac_id} claims partial coverage without an available evidence command`,
      );
    }
    if (
      criterion.coverage_state === "IMPLEMENTED_PASSING" &&
      (environment.availability !== "AVAILABLE" ||
        criterionCommands.some((command) => command.state !== "AVAILABLE") ||
        referencedSuites.some((suite) => suite.implementation_state !== "AVAILABLE"))
    ) {
      throw new Error(`${criterion.ac_id} claims passing coverage with planned evidence`);
    }
  }

  const retrievalCriterion = matrix.acceptance_criteria.find(
    (criterion) => criterion.ac_id === "AC-04",
  );
  if (
    JSON.stringify(retrievalCriterion?.blocking_decisions) !==
    JSON.stringify(["D-002", "D-007"])
  ) {
    throw new Error(
      "AC-04 read-only retrieval must be gated by D-002 and D-007 only; D-005 applies only to a model destination",
    );
  }

  return {
    acceptanceCriteriaCount: prdCriteria.length,
    acceptanceCriteriaDigest: calculatedDigest,
  };
}
