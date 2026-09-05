// Heuristic publication checks supplement full human/agent disclosure review.
// Findings contain locations and rule names, never the matched private value.
const rules = [
  ["personal-home-path", /\/(?:Users|home)\/[a-zA-Z0-9._-]+\//g],
  ["private-document-link", /https?:\/\/(?:docs|drive)\.google\.com\/(?:document|spreadsheets|presentation|file|drive)\/(?:d|folders)\/[a-zA-Z0-9_-]{12,}/g],
  ["private-network-domain", /https?:\/\/[a-zA-Z0-9.-]+\.(?:internal|corp)(?=[/:\s"'`]|$)/g],
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ["cloud-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ["github-token", /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g],
  ["oauth-client-id", /\b[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com\b/g],
];

export function scanPublicDisclosure(contents, path = "outbound") {
  const findings = [];
  for (const [rule, pattern] of rules) {
    pattern.lastIndex = 0;
    for (const match of contents.matchAll(pattern)) {
      findings.push({ path, rule, line: contents.slice(0, match.index).split("\n").length });
    }
  }
  const emails = /\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g;
  for (const match of contents.matchAll(emails)) {
    const domain = match[1].toLowerCase();
    if (match[0] === "git@github.com" || match[0] === "git@gitlab.com") continue;
    if (/(?:^|\.)example\.(?:com|org|net|invalid|test)$/.test(domain) || /\.(?:invalid|test)$/.test(domain)) continue;
    findings.push({ path, rule: "non-example-email", line: contents.slice(0, match.index).split("\n").length });
  }
  return findings;
}
