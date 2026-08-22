import test from "node:test";
import assert from "node:assert/strict";
import {
  PROOF_COMPILER_EXAMPLE,
  compileProofToInterview,
  parseArtifacts,
  validateProofCompiler
} from "../labs-src/labs/proofToInterviewCompiler.js";

test("compiler backs claims with artifact IDs and withholds unsupported metrics", () => {
  const result = compileProofToInterview(PROOF_COMPILER_EXAMPLE);

  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.claims.map((claim) => claim.status), ["backed", "backed", "do-not-claim"]);
  assert.ok(result.claims[0].citations.includes("LOG-SCAN-CODE"));
  assert.match(result.claims[2].reason, /numeric result/);
  assert.equal(result.resumeBullets.length, 2);
  assert.ok(result.resumeBullets.every((bullet) => /\[LOG-SCAN-/.test(bullet)));
  assert.doesNotMatch(result.resumeBullets.join(" "), /80%/);
});

test("NICE-aligned task map, STAR, packet, and gap drill preserve supplied evidence", () => {
  const result = compileProofToInterview(PROOF_COMPILER_EXAMPLE);

  assert.ok(result.taskMap.some((task) => task.status === "backed"));
  assert.match(result.starAnswer, new RegExp(PROOF_COMPILER_EXAMPLE.situation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(result.starAnswer, /\[LOG-SCAN-/);
  assert.match(result.evidencePacket, /No metric, employer, outcome, or hiring promise was added/);
  assert.match(result.gapDrill, /Reduced security incidents by 80%/);
});

test("claims without matching artifacts need evidence and release no bullet", () => {
  const result = compileProofToInterview({
    ...PROOF_COMPILER_EXAMPLE,
    skillClaims: "Configured enterprise firewalls for production networks"
  });

  assert.equal(result.claims[0].status, "needs-evidence");
  assert.deepEqual(result.resumeBullets, []);
  assert.match(result.evidencePacket, /No bullet released/);
});

test("a supplied outcome does not substitute for artifact proof of a metric", () => {
  const result = compileProofToInterview({
    ...PROOF_COMPILER_EXAMPLE,
    outcome: "The supplied project note says the parser improved review speed by 25 percent.",
    skillClaims: "Improved authentication log review speed by 25%",
    artifactRows: "LOG-CODE|code|Authentication log review parser with documented matching rules"
  });

  assert.equal(result.claims[0].status, "do-not-claim");
  assert.deepEqual(result.resumeBullets, []);
});

test("validation bounds artifacts and rejects links or unsupported types", () => {
  const parsed = parseArtifacts("A1|certificate|See https://example.com evidence");
  assert.ok(parsed.errors.some((error) => error.includes("type must be")));
  assert.ok(parsed.errors.some((error) => error.includes("not identities or links")));
  const errors = validateProofCompiler({});
  assert.ok(errors.errors.targetRole);
  assert.deepEqual(compileProofToInterview({}).claims, []);
});
