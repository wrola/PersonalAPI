import { Inject } from '@nestjs/common';
import { SkillHandler } from './skill.handler';
import {
  SKILLS_REPOSITORY,
  ISkillsRepository,
} from '../../infrastrucutre/skills.repository';
import { Skill } from '../skill.entity';
import {
  ACTIONS,
  IQdrantClient,
  QDRANT_CLIENT,
} from '../../../memory/infrastructure/qdrant.client';
import { Document } from 'langchain/document';

export class AddSkillHandler implements SkillHandler {
  constructor(
    readonly payload: Record<string, unknown>,
    @Inject(SKILLS_REPOSITORY) readonly skillRepository: ISkillsRepository,
    @Inject(QDRANT_CLIENT) readonly qdrantClient: IQdrantClient,
  ) {}
  async execute(): Promise<void> {
    const { name, description, synced = false } = this.payload;
    const skill = Skill.create(
      name,
      description,
      this.payload?.webhook,
      this.payload?.tags,
      this.payload?.schema,
    );
    this.skillRepository.save(skill);

    if (!synced) {
      const documentedMemory = new Document({
        pageContent: skill.name + ': ' + skill.description,
        metadata: {
          uuid: skill.id,
          name: skill.name,
        },
      });

      await this.qdrantClient.upsert(ACTIONS, {
        wait: true,
        batch: {
          ids: [documentedMemory.metadata.uuid],
          payloads: [documentedMemory.metadata],
        },
      });
    }
  }
}
