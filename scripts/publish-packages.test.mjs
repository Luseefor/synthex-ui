#!/usr/bin/env node
// Behavioral checks for scripts/publish-packages.mjs gate short-circuiting.
// Exercises planPublish control flow with stub runners, not YAML strings.
import test from "node:test";
import assert from "node:assert/strict";
import { GATES, PACKAGES, planPublish, publishArgs } from "./publish-packages.mjs";

test("failing gate short-circuits later gates and never publishes", () => {
  const calls = [];
  const code = planPublish({
    dryRun: true,
    run: (gate) => {
      calls.push(gate.name);
      return gate.name === "build" ? 3 : 0;
    },
    whoami: () => {
      calls.push("whoami");
      return 0;
    },
    publish: () => {
      calls.push("publish");
      return 0;
    },
  });
  assert.equal(code, 3);
  assert.deepEqual(calls, ["registry:check", "build"]);
});

test("dry-run skips auth probe but still publishes with --dry-run", () => {
  const calls = [];
  const seen = [];
  const code = planPublish({
    dryRun: true,
    run: () => 0,
    whoami: () => {
      calls.push("whoami");
      return 0;
    },
    publish: (pkg, args) => {
      calls.push(`publish:${pkg.name}`);
      seen.push(args);
      return 0;
    },
  });
  assert.equal(code, 0);
  assert.ok(!calls.includes("whoami"));
  assert.equal(calls.length, PACKAGES.length);
  assert.ok(seen.every((args) => args.includes("--dry-run")));
});

test("non-dry-run probes auth after gates and stops publish on failure", () => {
  const calls = [];
  const code = planPublish({
    dryRun: false,
    run: () => 0,
    whoami: () => {
      calls.push("whoami");
      return 1;
    },
    publish: () => {
      calls.push("publish");
      return 0;
    },
  });
  assert.equal(code, 1);
  assert.deepEqual(calls, ["whoami"]);
});

test("publish failure stops remaining packages with its exit code", () => {
  const calls = [];
  const code = planPublish({
    dryRun: true,
    run: () => 0,
    whoami: () => 0,
    publish: (pkg) => {
      calls.push(pkg.name);
      return pkg.name === PACKAGES[0].name ? 0 : 7;
    },
  });
  assert.equal(code, 7);
  assert.deepEqual(calls, [PACKAGES[0].name, PACKAGES[1].name]);
});

test("gates run registry first and cover build, artifacts, pack", () => {
  assert.deepEqual(
    GATES.map((gate) => gate.name),
    ["registry:check", "build", "release:check", "pack:check"],
  );
  assert.ok(!publishArgs(false).includes("--dry-run"));
});
