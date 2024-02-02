import { Inject, Logger } from '@nestjs/common';
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
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';

export class AddSkillHandler implements SkillHandler {
  payload: Record<string, unknown>;
  constructor(
    @Inject(SKILLS_REPOSITORY) readonly skillRepository: ISkillsRepository,
    @Inject(QDRANT_CLIENT) readonly qdrantClient: IQdrantClient,
  ) {}
  setPayload(payload: Record<string, unknown>): void {
    this.payload = payload;
  }
  async execute(): Promise<void> {
    if (!this.payload) {
      throw new Error('Payload is not set');
    }
    const { name, description, synced = false } = this.payload;
    const skill = Skill.create(
      name,
      description,
      this.payload?.webhook,
      this.payload?.tags,
      this.payload?.schema,
      this.payload?.id,
    );
    await this.skillRepository.save(skill);

    if (!synced) {
      const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5 });
      const [embedding] = await embeddings.embedDocuments([
        skill.name + ': ' + skill.description,
      ]);
      const documentedMemory = new Document({
        pageContent: skill.name + ': ' + skill.description,
        metadata: {
          uuid: skill.id,
          name: skill.name,
          content: `${skill.name}: ${skill.description}`,
        },
      });
      try {
        await this.qdrantClient.upsert(ACTIONS, {
          wait: true,
          batch: {
            ids: [documentedMemory.metadata.uuid],
            payloads: [documentedMemory], //TODO checkout the way now the skills are kept in DB? qdrant?
            vectors: [embedding],
          },
        });
        Logger.log('The skill added to qdrant', 'SKILLS');
      } catch (err) {
        Logger.error(err, 'SKILLS');
      }
    }
  }
}
