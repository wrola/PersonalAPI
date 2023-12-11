import { SkillHandler } from './skill.handler';

export class MemorySkillHandler implements SkillHandler {
  constructor(private payload: any) {
    this.payload = payload;
  }
}
