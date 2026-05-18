export type AlfaExecutionDecision = "ALLOW" | "DENY" | "DEFER" | "ESCALATE";

export type OpenChamberPermissionAction =
  | "tool_call"
  | "file_write"
  | "shell_command"
  | "git_operation"
  | "network_access";

export interface OpenChamberPermissionTarget {
  path?: string;
  command?: string;
  url?: string;
  toolName?: string;
}

export interface OpenChamberPermissionRequest {
  requestId: string;
  sessionId: string;
  agentId?: string;
  action: OpenChamberPermissionAction;
  target: OpenChamberPermissionTarget;
  promptContext?: string;
  diffSummary?: string;
  riskHints?: string[];
  createdAt?: string;
}

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

export interface AlfaPermissionAdapter {
  decide(request: OpenChamberPermissionRequest): Promise<AlfaDecisionEnvelope>;
}

