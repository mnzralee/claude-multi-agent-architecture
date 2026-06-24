/**
 * feature-flow.example.js
 *
 * A documented, generic orchestration skeleton for the kit: Research -> Design ->
 * Build -> Verify. It is a TEACHING EXAMPLE, not a turnkey script. It shows the
 * SHAPE of a well-formed multi-agent feature flow using this kit's agents and the
 * two rules that govern orchestration:
 *
 *   - ai-orchestration-decision-gate.md : decide before you orchestrate; pick the
 *     smallest pattern that fits; single writer, many readers.
 *   - ai-agent-engineering.md           : prove work with artifacts; prompt-writer
 *     first; the orchestrator re-runs acceptance commands itself.
 *
 * Adapt `dispatch()` to however you actually run sub-agents (the Claude Code Task
 * tool, the Agent SDK, or your own harness). The point here is the choreography.
 */

// Replace this stub with your real dispatcher (Task tool, Agent SDK, etc.).
// It must return the sub-agent's DISTILLED summary (1 to 2K tokens), not a transcript.
async function dispatch({ agent, prompt, tools, model, readOnly }) {
  throw new Error('Wire dispatch() to your runtime (Task tool / Agent SDK).');
}

// Re-run an acceptance command from the ORCHESTRATOR's own scope and return its
// exit code. Never trust a sub-agent's claim that a command passed.
async function runAcceptance(command) {
  throw new Error('Wire runAcceptance() to your shell. Return { code, stdout, stderr }.');
}

/**
 * The decision gate. Most tasks do not need a fan-out at all.
 * Return the smallest shape that fits.
 */
function chooseShape(task) {
  if (task.describableInOneSentence) return 'just-do-it';      // skip the plan
  if (task.fixedSteps) return 'workflow';                       // prompt-chaining
  if (task.independentReadHeavy) return 'parallel-readers';     // parallelization
  return 'orchestrator-workers';                                // open-ended
}

async function featureFlow(task) {
  // GATE: do not orchestrate if you do not need to.
  const shape = chooseShape(task);
  if (shape === 'just-do-it') {
    // One-sentence diff. Make the change directly, then verify. No sub-agents.
    return { note: 'Trivial change: implement inline, then run acceptance.' };
  }

  // 1. RESEARCH (read-only, parallelizable). Many readers, zero writers.
  //    Keep the orchestrator context clean by having each return a summary.
  const findings = await Promise.all([
    dispatch({ agent: 'researcher', readOnly: true, model: 'haiku',
      prompt: 'Find existing patterns and the blast radius for: ' + task.goal }),
    dispatch({ agent: 'security', readOnly: true, model: 'opus',
      prompt: 'Flag security-sensitive surfaces touched by: ' + task.goal }),
  ]);

  // 2. DESIGN (single frontier reasoner). Architecture before code.
  const design = await dispatch({ agent: 'architect', readOnly: true, model: 'opus',
    prompt: `Design the change. Inputs:\n${JSON.stringify(findings)}\n` +
            'Output: steps, the file each touches, and an acceptance command per step.' });

  // 3. BUILD (single writer). The prompt-writer first crafts a bounded brief,
  //    then ONE implementation agent executes. Writes never run in parallel.
  for (const step of design.steps) {
    const brief = await dispatch({ agent: 'prompt-writer', readOnly: true, model: 'haiku',
      prompt: `Write a bounded brief for this step: ${JSON.stringify(step)}. ` +
              'Include verified paths, the acceptance command, and forbidden actions ' +
              '(no push, no destructive ops, no scope creep).' });

    await dispatch({ agent: step.agent || 'backend-impl', model: 'sonnet',
      tools: ['Read', 'Edit', 'Write', 'Grep', 'Glob', 'Bash'],
      prompt: brief });

    // VERIFY each step from the orchestrator's own scope. Artifact, not narration.
    const { code, stdout } = await runAcceptance(step.acceptanceCommand);
    if (code !== 0) {
      // Self-correction loop: diagnose (no edits), re-brief, retry ONCE, else stop.
      const rootCause = await dispatch({ agent: 'debugger', readOnly: true, model: 'sonnet',
        prompt: `Acceptance failed:\n${stdout}\n5-Whys the root cause. Do not edit.` });
      throw new Error(`Step "${step.title}" failed. Root cause: ${rootCause}`);
    }
  }

  // 4. REVIEW (read-only critics, parallel). Then an evaluator scores against a rubric.
  const review = await Promise.all([
    dispatch({ agent: 'reviewer', readOnly: true, model: 'sonnet',
      prompt: 'Review the diff for correctness and convention fit. Findings by severity.' }),
    dispatch({ agent: 'evaluator', readOnly: true, model: 'opus',
      prompt: 'Score the change against its acceptance criteria. PASS / NEEDS_WORK / FAIL.' }),
  ]);

  // 5. COMMIT is performed by the single orchestrator thread, after the gate is green.
  //    (Use the /commit skill: conventional, file-by-file, no AI attribution.)
  return { design, review, note: 'All steps verified. Ready for /commit.' };
}

module.exports = { featureFlow, chooseShape };
