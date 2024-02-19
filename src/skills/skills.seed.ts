import { InjectRepository } from '@nestjs/typeorm';
import { ISkillsRepository } from './infrastrucutre/skills.repository';
import { Skill } from './core/skill.entity';
import { Skills, SkillsDescription } from './core/skills';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  ACTIONS,
  IQdrantClient,
  QDRANT_CLIENT,
} from '../memory/infrastructure/qdrant.client';
import { memorySchema } from './core/schemas/memory-schema';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';

export const SKILLS_SEED_SERVICE = Symbol('SKILLS_SEED_SERVICE');

@Injectable()
export class SkillSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Skill) private repository: ISkillsRepository,
    @Inject(QDRANT_CLIENT) private qdrantClient: IQdrantClient,
  ) {}
  async onModuleInit() {
    Logger.log('Start adding initila skills', 'SKILLS');
    return await this.addInitialSkills();
  }

  async addInitialSkills() {
    return Promise.all(
      InitSkills.map(async (skill) => {
        const { name, description, webhook, tags, schema, id } = skill;
        const newSkill = Skill.create(
          name,
          description,
          webhook,
          tags,
          schema,
          id,
        );
        const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5 });
        const [embedding] = await embeddings.embedDocuments([
          skill.name + ': ' + skill.description,
        ]);
        const documentedSkill = new Document({
          pageContent: skill.name + ': ' + skill.description,
          metadata: {
            uuid: skill.id,
            name: skill.name,
            content: `${skill.name}: ${skill.description}`,
          },
        });

        await this.repository.save(newSkill);

        try {
          return await Promise.all([
            this.repository.save(newSkill),
            this.qdrantClient.upsert(ACTIONS, {
              wait: true,
              batch: {
                ids: [documentedSkill.metadata.uuid],
                payloads: [documentedSkill],
                vectors: [embedding],
              },
            }),
          ]);

          Logger.log('The skill added to qdrant', 'SKILLS');
        } catch (err) {
          Logger.error(err, 'SKILLS');
        }
      }),
    );
  }
}

const InitSkills = [
  {
    name: Skills.MEMORY,
    description: SkillsDescription.MEMORY,
    tags: ['memorize', 'memory', 'remember'],
    webhook: 'http://localhost:3000/memories',
    id: '62075b91-d895-4e61-8a4c-b8b89ff909fb',
    schema: memorySchema,
  },
];
