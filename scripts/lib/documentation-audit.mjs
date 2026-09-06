import { existsSync, lstatSync, readFileSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";

export function auditDocumentation(root, paths) {
  const files = [...new Set(paths)].sort();
  const findings = [];
  const inventory = [];
  const add = (path, rule, detail) => findings.push({ path, rule, detail });
  for (const path of files) {
    const absolute = resolve(root, path);
    const rel = relative(root, absolute);
    if (rel.startsWith("../") || rel === ".." || !existsSync(absolute)) {
      add(path, "missing-or-outside-file", "Inventory entry cannot be read inside the repository");
      continue;
    }
    if (lstatSync(absolute).isSymbolicLink()) {
      add(path, "tracked-symlink", "Review the destination before including it in agent context");
      continue;
    }
    const extension = extname(path);
    const textKind = [".md", ".mjs", ".js", ".json", ".yaml", ".yml", ".html", ".css", ".svg"].includes(extension);
    inventory.push({ path, kind: textKind ? extension.slice(1) : "asset-or-other" });
    if (!textKind) continue;
    const text = readFileSync(absolute, "utf8");
    if (extension === ".json") {
      try { JSON.parse(text); } catch { add(path, "invalid-json", "JSON parsing failed"); }
    }
    if ([".mjs", ".js"].includes(extension)) {
      for (const match of text.matchAll(/^\s*(?:import\s+(?:[^;\n]*?\s+from\s*)?|export\s+[^;\n]*?\s+from\s*)["'](\.[^"']+)["']/gm)) {
        if (!existsSync(resolve(dirname(absolute), match[1]))) add(path, "missing-import", match[1]);
      }
    }
    if (extension !== ".md") continue;
    const withoutCode = text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, "");
    for (const match of withoutCode.matchAll(/!?\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      const target = match[1].replace(/^<|>$/g, "");
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      const [filePart, fragment] = target.split("#");
      let decoded;
      try { decoded = decodeURIComponent(filePart); } catch {
        add(path, "invalid-link-encoding", target); continue;
      }
      const destination = decoded ? resolve(dirname(absolute), decoded) : absolute;
      const destinationRel = relative(root, destination);
      if (destinationRel.startsWith("../") || destinationRel === "..") {
        add(path, "outside-link", target); continue;
      }
      if (!existsSync(destination)) { add(path, "missing-link", target); continue; }
      if (!fragment || extname(destination) !== ".md") continue;
      const body = readFileSync(destination, "utf8");
      const slugs = new Set();
      const counts = new Map();
      for (const heading of body.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
        const base = heading[1].toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}_\-\s]/gu, "").replace(/\s/g, "-");
        const n = counts.get(base) ?? 0;
        counts.set(base, n + 1);
        slugs.add(n ? `${base}-${n}` : base);
      }
      for (const anchor of body.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)) slugs.add(anchor[1]);
      let decodedFragment;
      try { decodedFragment = decodeURIComponent(fragment); } catch {
        add(path, "invalid-link-encoding", target); continue;
      }
      if (!slugs.has(decodedFragment)) add(path, "missing-anchor", target);
    }
  }
  return { files: inventory, findings };
}
