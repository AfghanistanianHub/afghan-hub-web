import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve, relative, isAbsolute } from "node:path";

const ROOT = process.cwd();
const MODEL = process.env.AFGHAN_HUB_AGENT_MODEL || "gpt-5.6-sol";
const EDITABLE = ["src/", "tests/", "docs/"];

function safePath(input) {
  const abs = resolve(ROOT, input);
  const rel = relative(ROOT, abs).replaceAll("\\", "/");
  if (!rel || rel.startsWith("../") || isAbsolute(rel)) throw new Error("Unsafe path");
  return { abs, rel };
}

function canEdit(rel) {
  return EDITABLE.some((p) => rel.startsWith(p));
}

function canRead(rel) {
  return canEdit(rel) ||
    ["AGENTS.md", "README.md", "package.json", "next.config.ts", ".github/workflows/node.js.yml"].includes(rel) ||
    rel.startsWith("node_modules/next/dist/docs/");
}

const readFileTool = tool({
  name: "read_file",
  description: "Read an allowed repo file. Read before editing. Next.js docs are available under node_modules/next/dist/docs/.",
  parameters: z.object({ path: z.string().min(1).max(300) }),
  async execute({ path }) {
    const { abs, rel } = safePath(path);
    if (!canRead(rel)) throw new Error("Read outside allowlist");
    if (!existsSync(abs) || !statSync(abs).isFile()) throw new Error("File not found");
    const value = readFileSync(abs, "utf8");
    if (value.length > 120000) throw new Error("File too large");
    return value;
  },
});

const searchTool = tool({
  name: "search",
  description: "Search repo source/tests/docs or installed Next.js docs for exact text.",
  parameters: z.object({
    query: z.string().min(2).max(160),
    scope: z.enum(["repo", "next_docs"]),
  }),
  async execute({ query, scope }) {
    const args = scope === "repo"
      ? ["grep", "-n", "-I", "-F", query, "--", "src", "tests", "docs"]
      : ["-R", "-n", "-I", "-F", "--", query, resolve(ROOT, "node_modules/next/dist/docs")];
    const cmd = scope === "repo" ? "git" : "grep";
    try {
      const out = execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1000000 });
      return out.split("\n").filter(Boolean).slice(0, 150).join("\n");
    } catch (error) {
      if (error && error.status === 1) return "No matches.";
      throw error;
    }
  },
});

const writeFileTool = tool({
  name: "write_file",
  description: "Create or rewrite one file under src/, tests/, or docs/. Keep edits focused.",
  parameters: z.object({
    path: z.string().min(1).max(300),
    content: z.string().max(120000),
  }),
  async execute({ path, content }) {
    const { abs, rel } = safePath(path);
    if (!canEdit(rel)) throw new Error("Edit outside Level 1 allowlist");
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
    return "Wrote " + rel;
  },
});

function includeUntracked() {
  const out = execFileSync("git", ["ls-files", "--others", "--exclude-standard", "--", "src", "tests", "docs"], { cwd: ROOT, encoding: "utf8" });
  const files = out.split("\n").filter(Boolean);
  if (files.length) execFileSync("git", ["add", "-N", "--", ...files], { cwd: ROOT });
}

function currentDiff() {
  includeUntracked();
  return execFileSync("git", ["diff", "--", "src", "tests", "docs"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1200000 }).slice(0, 100000) || "No diff.";
}

const diffTool = tool({
  name: "git_diff",
  description: "Inspect the current Level 1 working tree diff.",
  parameters: z.object({}),
  async execute() { return currentDiff(); },
});

const readTools = [readFileTool, searchTool, diffTool];
const buildTools = [...readTools, writeFileTool];

const Plan = z.object({
  action: z.enum(["work", "stop"]),
  title: z.string().min(3).max(80),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  summary: z.string().min(10).max(800),
  risk: z.enum(["low", "medium", "high"]),
  requiresHumanApproval: z.boolean(),
  reason: z.string().min(10).max(1000),
});

const Review = z.object({
  pass: z.boolean(),
  summary: z.string().min(5).max(1000),
  blockers: z.array(z.string().max(500)).max(10),
});

const planner = new Agent({
  name: "Afghan Hub Planner",
  model: MODEL,
  outputType: Plan,
  tools: readTools,
  instructions: "Read docs/agent/autopilot-policy.md and AGENTS.md. Pick exactly one highest-value low-risk RC1 task that is not already complete. Level 1 must not touch migrations, RLS, auth permissions, user data deletion, secrets, dependencies, workflows, production config, or other human-gated work. Return stop if no clearly safe task exists.",
});

const builder = new Agent({
  name: "Afghan Hub Builder",
  model: MODEL,
  tools: buildTools,
  instructions: "Implement only the assigned Level 1 task. Read relevant files first. You may edit only src/, tests/, docs/. Preserve behavior outside scope. Read AGENTS.md; for Next.js framework behavior, inspect node_modules/next/dist/docs first. Add regression coverage when practical. Never perform production actions.",
});

const reviewer = new Agent({
  name: "Afghan Hub Reviewer",
  model: MODEL,
  outputType: Review,
  tools: readTools,
  instructions: "Review the current diff strictly for correctness, regression risk, scope, accessibility/error handling, and adequate tests. Do not edit. Fail only for concrete blockers.",
});

const securityReviewer = new Agent({
  name: "Afghan Hub Security Reviewer",
  model: MODEL,
  outputType: Review,
  tools: readTools,
  instructions: "Review the current diff for security/privacy regressions: authorization, cross-user access, unsafe links/data, injection/XSS, secrets, destructive behavior, or persistence changes. Do not edit. Level 1 must not change database authorization or production config.",
});

function changedFiles() {
  includeUntracked();
  return execFileSync("git", ["diff", "--name-only"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
}

function assertSafe(files) {
  const bad = files.filter((f) => !EDITABLE.some((p) => f.startsWith(p)));
  if (bad.length) throw new Error("Disallowed changed files: " + bad.join(", "));
}

function check(name, cmd, args) {
  try {
    execFileSync(cmd, args, { cwd: ROOT, stdio: "pipe", maxBuffer: 2000000, env: process.env });
    return { name, ok: true, output: "" };
  } catch (error) {
    return { name, ok: false, output: String(error.stdout || "") + "\n" + String(error.stderr || "") };
  }
}

function validate() {
  const tests = readdirSync(resolve(ROOT, "tests")).filter((n) => n.endsWith(".test.mjs")).map((n) => "tests/" + n);
  const results = [
    check("lint", "npm", ["run", "lint"]),
    check("typecheck", "npx", ["tsc", "--noEmit"]),
    check("tests", "node", ["--test", ...tests]),
    check("build", "npm", ["run", "build"]),
    check("diff-check", "git", ["diff", "--check"]),
  ];
  return { ok: results.every((r) => r.ok), results };
}

function validationText(v) {
  return v.results.map((r) => (r.ok ? "PASS " : "FAIL ") + r.name + (r.ok ? "" : "\n" + r.output.slice(-5000))).join("\n\n");
}

async function doReviews(task) {
  const prompt = "Review the current diff for this task:\n\n" + task;
  const [a, b] = await Promise.all([run(reviewer, prompt, { maxTurns: 4 }), run(securityReviewer, prompt, { maxTurns: 4 })]);
  return { code: a.finalOutput, security: b.finalOutput };
}

function reviewsPass(r) {
  return Boolean(r.code && r.code.pass && r.security && r.security.pass);
}

function reviewText(r) {
  return "Code: " + (r.code?.summary || "") + "\n" + (r.code?.blockers || []).join("\n") +
    "\nSecurity: " + (r.security?.summary || "") + "\n" + (r.security?.blockers || []).join("\n");
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "rc1-task";
}

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
  if (execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf8" }).trim()) throw new Error("Clean checkout required");

  const planned = await run(planner, "Select the single best safe Level 1 task to advance Afghan Hub toward RC1.", { maxTurns: 4 });
  const plan = planned.finalOutput;
  if (!plan) throw new Error("Planner returned no plan");
  console.log("Plan:", JSON.stringify(plan, null, 2));

  if (plan.action === "stop" || plan.risk !== "low" || plan.requiresHumanApproval) {
    console.log("Stopped safely: " + plan.reason);
    return;
  }

  const branch = "agent/autopilot-" + (process.env.GITHUB_RUN_ID || Date.now()) + "-" + slug(plan.slug);
  execFileSync("git", ["checkout", "-b", branch], { cwd: ROOT, stdio: "inherit" });

  const task = "Task: " + plan.title + "\n\n" + plan.summary + "\n\nWhy now: " + plan.reason;
  await run(builder, task, { maxTurns: 7 });

  let files = changedFiles();
  assertSafe(files);
  if (!files.length) {
    console.log("No changes produced.");
    return;
  }

  let reviews = await doReviews(task);
  if (!reviewsPass(reviews)) {
    await run(builder, task + "\n\nFix these concrete review blockers only:\n" + reviewText(reviews), { maxTurns: 5 });
    files = changedFiles();
    assertSafe(files);
    reviews = await doReviews(task);
  }
  if (!reviewsPass(reviews)) throw new Error("Reviews did not pass:\n" + reviewText(reviews));

  const validation = validate();
  if (!validation.ok) throw new Error("Validation failed:\n" + validationText(validation));

  execFileSync("git", ["config", "user.name", "Afghan Hub Agent"], { cwd: ROOT });
  execFileSync("git", ["config", "user.email", "afghan-hub-agent@users.noreply.github.com"], { cwd: ROOT });
  execFileSync("git", ["add", "--", ...files], { cwd: ROOT });
  execFileSync("git", ["commit", "-m", "agent: " + plan.title], { cwd: ROOT, stdio: "inherit" });

  const token = process.env.AFGHAN_HUB_AGENT_GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) throw new Error("GitHub token required");
  const env = { ...process.env, GH_TOKEN: token };
  execFileSync("gh", ["auth", "setup-git"], { cwd: ROOT, env, stdio: "inherit" });
  execFileSync("git", ["push", "-u", "origin", branch], { cwd: ROOT, env, stdio: "inherit" });

  const bodyPath = "/tmp/afghan-hub-agent-pr.md";
  const body = [
    "## Afghan Hub Autopilot - Level 1",
    "",
    "**Task:** " + plan.title,
    "",
    plan.summary,
    "",
    "### Agent reviews",
    "",
    "Code reviewer: " + reviews.code.summary,
    "",
    "Security reviewer: " + reviews.security.summary,
    "",
    "### Deterministic validation",
    "",
    "    " + validationText(validation).replaceAll("\n", "\n    "),
    "",
    "### Safety",
    "",
    "- Editable allowlist: src/, tests/, docs/ only.",
    "- No migration or Production action was performed.",
    "- Level 1 does not auto-merge its own PR.",
    "- GitHub CI and Vercel Preview remain release gates.",
  ].join("\n");
  writeFileSync(bodyPath, body, "utf8");

  const url = execFileSync("gh", ["pr", "create", "--base", "main", "--head", branch, "--title", "[agent] " + plan.title, "--body-file", bodyPath], { cwd: ROOT, env, encoding: "utf8" }).trim();
  console.log("Created PR: " + url);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
