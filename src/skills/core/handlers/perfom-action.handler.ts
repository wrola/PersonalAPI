import {
  ACTIONS,
  IQdrantClient,
  QDRANT_CLIENT,
} from '../../../memory/infrastructure/qdrant.client';
import { IMemoryService, MEMORY_SERVICE } from '../../../memory/memory.service';
import {
  ISkillsRepository,
  SKILLS_REPOSITORY,
} from '../../infrastrucutre/skills.repository';
import { SkillHandler } from './skill.handler';
import { Inject, Logger } from '@nestjs/common';

export class PerformAction implements SkillHandler {
  constructor(
    @Inject(QDRANT_CLIENT) private qdrantClient: IQdrantClient,
    @Inject(SKILLS_REPOSITORY) private skillsRepository: ISkillsRepository,
    @Inject(MEMORY_SERVICE) private memoryService: IMemoryService,
  ) {}
  payload: Record<string, unknown>;
  async execute(): Promise<void> {
    const { embedding, query, context } = this.payload;
    const actions = await this.qdrantClient.search(ACTIONS, {
      vector: embedding,
      limit: 1,
      filter: {
        must: [
          {
            key: 'source',
            match: {
              value: ACTIONS,
            },
          },
        ],
      },
    });

    const uuid = await this.memoryService.plan(
      query as string,
      actions as any[],
      context,
    );

    const action = this.skillsRepository.findOne(uuid);

    if (!action) {
      Logger.error('No such action', `The action uuid not exists: ${uuid}`);
    }
  }
}
