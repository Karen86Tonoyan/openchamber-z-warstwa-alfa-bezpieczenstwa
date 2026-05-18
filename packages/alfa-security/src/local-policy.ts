import type { AlfaDecisionEnvelope, OpenChamberPermissionRequest } from "./types";

const HIGH_RISK_HINTS = new Set([
  "credential_exposure",
  "secret_access",
  "data_exfiltration",
  "prompt_injection",
  "policy_bypass",
]);

const SENSITIVE_PATH_PATTERNS = [
  /\.env(\.|$)?/i,
  /(^|[\\/])\.ssh([\\/]|$)/i,
  /(^|[\\/])\.aws([\\/]|$)/i,
  /(^|[\\/])\.config[\\/]opencode([\\/]|$)/i,
  /(^|[\\/])secrets?([\\/]|\.|$)/i,
  /(^|[\\/])credentials?([\\/]|\.|$)/i,
];

const DESTRUCTIVE_COMMAND_PATTERNS = [
  /\brm\s+-rf\b/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\bgit\s+clean\s+-fd\b/i,
  /\bRemove-Item\b.*\s-Recurse\b/i,
  /\bdel\s+\/s\b/i,
  /\bformat\b/i,
];

function envelope(partial: Omit<AlfaDecisionEnvelope, "policyVersion" | "schemaVersion">): AlfaDecisionEnvelope {
  return {
    ...partial,
    policyVersion: "openchamber-alfa-local-policy/0.1.0",
    schemaVersion: "0.1.0",
  };
}

function hasHighRiskHint(request: OpenChamberPermissionRequest): boolean {
  return (request.riskHints ?? []).some((hint) => HIGH_RISK_HINTS.has(hint));
}

function touchesSensitivePath(request: OpenChamberPermissionRequest): boolean {
  const path = request.target.path ?? "";
  return Boolean(path) && SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

function runsDestructiveCommand(request: OpenChamberPermissionRequest): boolean {
  const command = request.target.command ?? "";
  return Boolean(command) && DESTRUCTIVE_COMMAND_PATTERNS.some((pattern) => pattern.test(command));
}

function targetsExternalNetwork(request: OpenChamberPermissionRequest): boolean {
  if (request.action !== "network_access") return false;
  const url = request.target.url ?? "";
  if (!url) return true;

  try {
    const parsed = new URL(url);
    return !["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return true;
  }
}

export function evaluateLocalAlfaPolicy(request: OpenChamberPermissionRequest): AlfaDecisionEnvelope {
  if (hasHighRiskHint(request)) {
    return envelope({
      decision: "DENY",
      reason: "High-risk policy hint requires blocking until verified by ALFA-EOS.",
      confidence: 0.9,
    });
  }

  if (runsDestructiveCommand(request)) {
    return envelope({
      decision: "ESCALATE",
      reason: "Destructive shell command requires explicit human/admin review.",
      confidence: 0.82,
    });
  }

  if (touchesSensitivePath(request)) {
    return envelope({
      decision: "ESCALATE",
      reason: "Sensitive path access requires stronger review before execution.",
      confidence: 0.78,
    });
  }

  if (targetsExternalNetwork(request)) {
    return envelope({
      decision: "DEFER",
      reason: "External network access needs additional context or policy verification.",
      confidence: null,
    });
  }

  return envelope({
    decision: "ALLOW",
    reason: "No local ALFA risk rule matched. Real ALFA-EOS verification can replace this default.",
    confidence: 0.55,
  });
}

