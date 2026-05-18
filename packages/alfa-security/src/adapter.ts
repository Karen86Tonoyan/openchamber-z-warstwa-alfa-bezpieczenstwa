import { evaluateLocalAlfaPolicy } from "./local-policy";
import type { AlfaDecisionEnvelope, AlfaPermissionAdapter, OpenChamberPermissionRequest } from "./types";

export interface CreateLocalAlfaAdapterOptions {
  tracePrefix?: string;
}

export function createLocalAlfaPermissionAdapter(
  options: CreateLocalAlfaAdapterOptions = {}
): AlfaPermissionAdapter {
  const tracePrefix = options.tracePrefix ?? "local-alfa";

  return {
    async decide(request: OpenChamberPermissionRequest): Promise<AlfaDecisionEnvelope> {
      const decision = evaluateLocalAlfaPolicy(request);
      return {
        ...decision,
        traceRef: decision.traceRef ?? `${tracePrefix}:${request.sessionId}:${request.requestId}`,
      };
    },
  };
}

