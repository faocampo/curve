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

const temporary = mkdtempSync(join(tmpdir(), "curve-mermaid-"));
try {
  diagrams.forEach((diagram, index) => {
    const input = join(temporary, `${index}.mmd`);
    const output = join(temporary, `${index}.svg`);
    writeFileSync(input, `${diagram.source}\n`);
    try {
      execFileSync(join(root, "node_modules/.bin/mmdc"), ["--quiet", "--input", input, "--output", output], {
        stdio: "pipe"
      });
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
