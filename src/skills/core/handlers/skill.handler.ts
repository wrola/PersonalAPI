export interface SkillHandler {
  payload: Record<string, unknown>;
  execute(): Promise<void>;
  setPayload(payload: Record<string, unknown>): void; // TODO remove when swithc to CQRS
}
