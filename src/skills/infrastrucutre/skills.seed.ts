import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { ISkillsRepository } from './skills.repository';
import { Skill } from '../core/skill.entity';
import { Skills, SkillsDescription } from '../core/skills';
import { AddSkillHandler } from '../core/handlers/add-skill.handler';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IQdrantClient,
  QDRANT_CLIENT,
} from '../../memory/infrastructure/qdrant.client';
import { learnSchema } from '../core/schemas/learn-schema';

export const SKILLS_SEED_SERVICE = Symbol('SKILLS_SEED_SERVICE');

@Injectable()
export class SkillSeedService {
  constructor(
    @InjectRepository(Skill) private repository: ISkillsRepository,
    @Inject(QDRANT_CLIENT) private qdrantClient: IQdrantClient,
  ) {}

  async initializeSkills() {
    Logger.log(this.areInitialSkillsAvailable());
    if (await this.areInitialSkillsAvailable()) {
      return;
    }
    Logger.log('Start adding initila skills', 'SKILLS');
    await this.addInitialSkills();
  }

  async areInitialSkillsAvailable() {
    const initSkills = await this.repository.find({
      where: { name: In(Object.values(Skills)) },
    });
    return Object.values(Skills).length === initSkills.length;
  }

  async addInitialSkills() {
    return Promise.all(
      [
        new AddSkillHandler(
          {
            name: Skills.LEARNING,
            description: SkillsDescription.LEARNING,
            tags: ['memorize', 'memory', 'remember', 'skill'],
            webhook: 'http://localhost:3000/learn',
            schema: learnSchema,
          },
          this.repository,
          this.qdrantClient,
        ),
        new AddSkillHandler(
          {
            name: Skills.MEMORY,
            description: SkillsDescription.MEMORY,
            tags: ['memorize', 'memory', 'remember'],
          },
          this.repository,
          this.qdrantClient,
        ),
      ].map(async (skill) => {
        Logger.log(skill, 'SKILLS');
        await skill.execute();
      }),
    );
  }
}
