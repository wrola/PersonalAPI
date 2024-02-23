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
    Logger.log('Start adding initial skills', 'SKILLS');
    return await this.addInitialSkills();
  }

  async addInitialSkills() {
    return Promise.all(
      InitSkills.map(
        async ({ name, description, webhook, tags, schema, id }) => {
          const newSkill = Skill.create(
            name,
            description,
            webhook,
            tags,
            schema,
            id,
          );

          const documentedSkill = new Document({
            pageContent: name + ': ' + description,
            metadata: {
              uuid: id,
              name: name,
              content: `${name}: ${description}`,
            },
          });

          const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5 });
          const [embedding] = await embeddings.embedDocuments([
            name + ': ' + description,
          ]);

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
          } catch (err) {
            Logger.error(err, 'SKILLS');
          }
          Logger.log('The skill added to qdrant', 'SKILLS');
        },
      ),
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
