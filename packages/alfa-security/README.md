# @openchamber/alfa-security

Experimental ALFA-EOS / Magic Filters adapter contracts for OpenChamber.

This package is intentionally small and not wired into runtime routes yet. It defines the permission request shape, the ALFA decision envelope, and a safe default local evaluator for early integration tests.

## Boundary

```txt
OpenChamber PermissionRequest
  -> alfa-security adapter
  -> Magic Filters / ALFA-EOS
  -> AlfaDecisionEnvelope
  -> OpenChamber permission UI
```

OpenChamber owns the workspace and permission UI. ALFA-EOS owns verified-state execution permission semantics.

## Decisions

| decision | meaning |
|---|---|
| `ALLOW` | Continue execution. |
| `DENY` | Block execution. |
| `DEFER` | Not enough evidence; ask for more context or wait for verification. |
| `ESCALATE` | Require stronger human/admin review. |

## Safe default

The local evaluator is intentionally conservative:

- destructive shell commands -> `ESCALATE`
- sensitive file paths -> `ESCALATE`
- external network access -> `DEFER`
- high risk hints -> `DENY`
- otherwise -> `ALLOW`

Replace it with a real Magic Filters / ALFA-EOS API call when the adapter endpoint exists.

## Example

```ts
import { createLocalAlfaPermissionAdapter } from "@openchamber/alfa-security";

const adapter = createLocalAlfaPermissionAdapter();

const decision = await adapter.decide({
  requestId: "perm-001",
  sessionId: "session-123",
  action: "shell_command",
  target: {
    command: "git status",
  },
});

console.log(decision.decision);
```

Expected result:

```txt
ALLOW
```

Destructive or sensitive requests return `ESCALATE`, `DENY`, or `DEFER` depending on the local rule. This is a development stub, not the final ALFA-EOS truth runtime.
