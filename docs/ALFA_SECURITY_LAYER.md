# ALFA Security Layer Preview

This document is an architecture teaser for adding an ALFA / Magic Filters decision layer under OpenChamber-style agent workspaces.

It is not an implementation drop. Do not copy filter runtime code into OpenChamber directly. Treat this as the integration boundary that keeps the operational shell separate from the epistemic/security runtime.

## Positioning

```txt
OpenChamber = agent workspace, UI, diffs, permissions, skills, GitHub workflow
Magic Filters = TypeScript filter/policy/pipeline/SOC implementation surface
ALFA-EOS = epistemic integrity kernel and execution permission runtime
```

OpenChamber can display and request permissions. ALFA-EOS decides whether execution is justified by verified state.

## Integration Shape

```txt
OpenChamber / OpenCode session
  -> ALFA adapter API
  -> Magic Filters
  -> ALFA-EOS claim/evidence runtime
  -> ALLOW / DENY / DEFER / ESCALATE
  -> OpenChamber permission UI
```

The OpenChamber permission UI should consume ALFA decisions. It should not define the truth or verification semantics itself.

## Decision Contract

Minimal ALFA decision envelope:

```ts
export type AlfaExecutionDecision =
  | "ALLOW"
  | "DENY"
  | "DEFER"
  | "ESCALATE";

export interface AlfaDecisionEnvelope {
  decision: AlfaExecutionDecision;
  reason: string;
  confidence: number | null;
  claimId?: string;
  evidenceIds?: string[];
  policyVersion: string;
  schemaVersion: "0.1.0";
  traceRef?: string;
}
```

Decision meanings:

| decision | meaning |
|---|---|
| `ALLOW` | The requested execution is permitted by verified or sufficient evidence state. |
| `DENY` | The requested execution conflicts with policy, evidence, or verified state. |
| `DEFER` | The system lacks enough evidence; ask for clarification, evidence lookup, or human review. |
| `ESCALATE` | The request requires stronger review, arbitration, or administrator-level approval. |

## Magic Filters Boundary

Magic Filters should not be flattened into one generic filter registry inside OpenChamber.

Keep these responsibilities separate:

| layer | role |
|---|---|
| runtime filters | lightweight pre/post model transforms and guards |
| Tonoyan pipeline | staged security and prompt analysis pipeline |
| ALFA policy | policy, graph, evidence, and decision semantics |
| detectors | stress, anomaly, and resilience signal producers |
| SOC projection | normalized security event/read-model surface |

Adapter rule:

```txt
OpenChamber permission request
  -> normalize request
  -> call ALFA adapter
  -> receive decision envelope
  -> render permission state
```

Do not merge OpenChamber permission prompts with ALFA-EOS execution permission semantics.

## Example Permission Flow

```txt
Agent wants to edit file or run command
  -> OpenChamber builds PermissionRequest
  -> ALFA adapter classifies intent and target
  -> Magic Filters checks prompt/runtime/security signals
  -> ALFA-EOS evaluates claim/evidence state
  -> OpenChamber shows:
       ALLOW: continue
       DENY: block with reason
       DEFER: ask for more context
       ESCALATE: require explicit human/admin approval
```

## Example Adapter Payload

```ts
export interface OpenChamberPermissionRequest {
  requestId: string;
  sessionId: string;
  agentId?: string;
  action: "tool_call" | "file_write" | "shell_command" | "git_operation" | "network_access";
  target: {
    path?: string;
    command?: string;
    url?: string;
    toolName?: string;
  };
  promptContext?: string;
  diffSummary?: string;
  riskHints?: string[];
}
```

## What This Enables

- permission prompts backed by evidence state, not only UX confirmation
- multi-agent run comparison with ALFA arbitration traces
- skills that call policy inspectors before risky execution
- SOC projection for security-relevant agent actions
- replayable decision logs for forensic review

## Non-goals

- Do not turn OpenChamber into ALFA-EOS.
- Do not move Magic Filters code into OpenChamber without an adapter contract.
- Do not treat guardrails as equivalent to verified execution permission.
- Do not collapse skills, filters, policy, evidence, and SOC into one folder.

## Future Adapter Candidates

| adapter | purpose |
|---|---|
| `alfa-permission-adapter` | maps OpenChamber permission requests to ALFA decisions |
| `magic-filters-adapter` | calls TypeScript filter/policy pipeline and returns normalized metadata |
| `soc-projection-adapter` | emits normalized security events for agent actions |
| `evidence-replay-adapter` | replays decisions and evidence transitions for audit |

