import {
  ACTIONS,
  IQdrantClient,
  QDRANT_CLIENT,
} from '../../../memory/infrastructure/qdrant.client';
import { SkillHandler } from './skill.handler';
import { Inject } from '@nestjs/common';

export class PerformAction implements SkillHandler {
  constructor(@Inject(QDRANT_CLIENT) private qdrantClient: IQdrantClient) {}
  payload: Record<string, unknown>;
  async execute(): Promise<void> {
    const { embedding } = this.payload;
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
    
    return;
  }
}
