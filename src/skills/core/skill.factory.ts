import { Inject, InternalServerErrorException } from '@nestjs/common';
import { SkillHandler } from './handlers/skill.handler';
import { Skills } from './skills';
import { AddMemoryHandler } from './handlers/add-memory.handler';
import { IMemoryService, MEMORY_SERVICE } from '../../memory/memory.service';
import { MemoryInput } from '../../memory/core/entities/memory.entity';
import { AddSkillHandler } from './handlers/add-skill.handler';
import {
  ISkillsRepository,
  SKILLS_REPOSITORY,
} from '../infrastrucutre/skills.repository';

export class SkillHandlerFactory implements ISkillHandlerFactory {
  constructor(
    @Inject(MEMORY_SERVICE) private memoryService: IMemoryService,
    @Inject(SKILLS_REPOSITORY) private skillRepository: ISkillsRepository,
  ) {}
  create(payload: Record<string, unknown>): SkillHandler {
    const { type } = payload;
    switch (type) {
      case Skills.MEMORY:
        const { content, tags, source } = payload;
        return new AddMemoryHandler(
          { content, tags, source } as MemoryInput,
          this.memoryService,
        );
      case Skills.LEARNING:
        return new AddSkillHandler(payload, this.skillRepository);
      default:
        throw new InternalServerErrorException('Skill not exists');
    }
  }
}

export interface ISkillHandlerFactory {
  create(payload): SkillHandler;
}

export const SKILL_HANDLER_FACTORY = Symbol('SKILL_HANDLER_FACTORY');
