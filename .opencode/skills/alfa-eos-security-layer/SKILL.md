---
name: alfa-eos-security-layer
description: Use when designing OpenChamber integrations with ALFA-EOS, Magic Filters, permission prompts, security adapters, evidence checks, or execution gating.
license: MIT
compatibility: opencode
---

# ALFA-EOS Security Layer Skill

## Purpose

Use this skill when adding or modifying architecture, docs, adapters, or UI flows that connect OpenChamber permissions with ALFA-EOS / Magic Filters.

The core rule: OpenChamber presents and orchestrates permissions; ALFA-EOS owns epistemic execution permission.

## Positioning

```txt
OpenChamber = operational shell
Magic Filters = filter/policy/pipeline surface
ALFA-EOS = integrity kernel
```

## Mandatory Boundary

Do not merge these concepts:

- UI permission prompt
- runtime filter
- policy oracle
- evidence arbitration
- execution permission
- SOC projection

They can talk through adapters, but they should not become one module.

## Integration Flow

Prefer this shape:

```txt
OpenChamber PermissionRequest
  -> ALFA adapter
  -> Magic Filters / ALFA-EOS
  -> AlfaDecisionEnvelope
  -> OpenChamber permission UI
```

The UI should render one of:

- `ALLOW`
- `DENY`
- `DEFER`
- `ESCALATE`

## Decision Envelope

Use this conceptual shape unless a newer contract exists:

```ts
interface AlfaDecisionEnvelope {
  decision: "ALLOW" | "DENY" | "DEFER" | "ESCALATE";
  reason: string;
  confidence: number | null;
  claimId?: string;
  evidenceIds?: string[];
  policyVersion: string;
  schemaVersion: "0.1.0";
  traceRef?: string;
}
```

## Design Rules

- Keep OpenChamber as a rich interface and workspace.
- Keep ALFA-EOS as the verified-state and execution permission owner.
- Keep Magic Filters behind adapter boundaries.
- Make fallback or degraded states explicit.
- Preserve audit references for risky tool calls, file writes, shell commands, git operations, and network access.
- Do not make a green permission state when ALFA is unavailable; use `DEFER` or `ESCALATE`.

## Documentation Source

Read `docs/ALFA_SECURITY_LAYER.md` before implementing any ALFA-related permission or adapter work.

