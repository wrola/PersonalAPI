export interface SkillHandler {
  readonly payload: Record<string, unknown>;
  execute(): Promise<void>;
}
