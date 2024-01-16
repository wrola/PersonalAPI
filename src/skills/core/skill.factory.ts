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
import {
  IQdrantClient,
  QDRANT_CLIENT,
} from '../../memory/infrastructure/qdrant.client';

export class SkillHandlerFactory implements ISkillHandlerFactory {
  constructor(
    @Inject(MEMORY_SERVICE) private memoryService: IMemoryService,
    @Inject(SKILLS_REPOSITORY) private skillRepository: ISkillsRepository,
    @Inject(QDRANT_CLIENT) private qdrantClient: IQdrantClient,
  ) {}
  create(payload: Record<string, unknown>): SkillHandler {
    const { type } = payload;
    let handler: SkillHandler;
    switch (type) {
      case Skills.MEMORY:
        const { content, tags, source } = payload;
        handler = new AddMemoryHandler(this.memoryService);
        handler.setPayload({
          content,
          tags,
          source,
        } as MemoryInput);
        return handler;
      case Skills.LEARNING:
        handler = new AddSkillHandler(this.skillRepository, this.qdrantClient);
        handler.setPayload(payload);
        return handler;
      default:
        throw new InternalServerErrorException('Skill not exists');
    }
  }
}

export interface ISkillHandlerFactory {
  create(payload): SkillHandler;
}

export const SKILL_HANDLER_FACTORY = Symbol('SKILL_HANDLER_FACTORY');
