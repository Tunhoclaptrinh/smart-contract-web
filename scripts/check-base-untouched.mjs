// Fails when a branch outside the base flow changes base files (docs/QUY_TRINH_NHANH.md).
//
// Only changes made since the branch last took the base count (`git diff <merge-base with
// origin/base> HEAD`), so merging a newer base never trips the check.
//
// Usage: node scripts/check-base-untouched.mjs      (CI runs it on every push and pull request)
import { execFileSync } from "node:child_process";

/** What a business branch may change. Everything else belongs to the base. */
const ALLOWED = [
  "src/features/", // one folder per business area: pages, components, hooks, lib, api, tests
  "src/locales/", // one JSON per namespace, vi and en
  "src/router.tsx", // one lazy route per screen
  "src/shared/layout/navConfig.ts", // menu item and route permission per screen
  "public/",
  "package.json", // dependencies a feature needs
  "pnpm-lock.yaml",
  "README.md",
  "CHANGELOG.md",
  "docs/bao-cao/",
];

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const tryGit = (...args) => {
  try {
    return git(...args);
  } catch {
    return null;
  }
};

const current = () => git("branch", "--show-current");
const target =
  process.env.GITHUB_BASE_REF || process.env.GITHUB_REF_NAME || current();
const head =
  process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || current();
if (target === "base" || head === "base" || head.startsWith("core/")) {
  console.log(`base check skipped: ${head} → ${target} is base work`);
  process.exit(0);
}

const baseRef = "origin/base";
tryGit("fetch", "--quiet", "origin", "base:refs/remotes/origin/base");
const mergeBase = tryGit("merge-base", "HEAD", baseRef);
if (!mergeBase) {
  console.error(
    `base check: no common history with ${baseRef} (shallow clone? use fetch-depth: 0)`,
  );
  process.exit(1);
}
const changed = git("diff", "--name-only", mergeBase, "HEAD")
  .split("\n")
  .filter(Boolean);
const touched = changed.filter(
  (file) => !ALLOWED.some((p) => file === p || file.startsWith(p)),
);
if (touched.length) {
  console.error(
    `These base files changed outside the base flow (${head} → ${target}):`,
  );
  for (const file of touched) console.error(`  ${file}`);
  console.error(
    "\nRevert them here and make the change on a core/<task> branch into base " +
      "(docs/QUY_TRINH_NHANH.md), then merge main.",
  );
  process.exit(1);
}
console.log(
  `base check passed: ${changed.length} changed file(s), none of them base (vs ${baseRef})`,
);
