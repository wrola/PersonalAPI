import { NotFoundException } from '@nestjs/common';
import { MemorySkillHandler } from './handlers/memory-skill.handler';
import { SkillHandler } from './handlers/skill.handler';
import { Skills } from './skills';

export class SkillHandlerFactory implements ISkillHandlerFactory {
  create(payload: Record<string, unknown>): SkillHandler {
    const { type } = payload;
    switch (type) {
      case Skills.MEMORY:
        return new MemorySkillHandler(payload);
      default:
        throw new NotFoundException('Skill not exists');
    }
  }
}

interface ISkillHandlerFactory {
  create(payload): SkillHandler;
}

export const SKILL_HANDLER_FACTORY = Symbol('SKILL_HANDLER_FACTORY');
