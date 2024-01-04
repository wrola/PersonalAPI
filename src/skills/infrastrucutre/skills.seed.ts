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
    if (this.areAllInitialSkillsAvailable()) {
      return;
    }

    await this.addInitialSkills();
    Logger.log('Added Initial Skillset');
  }

  async areAllInitialSkillsAvailable() {
    const initSkills = await this.repository.find({
      where: { name: In(Object.values(Skills)) },
    });

    return (
      initSkills.length > 0 &&
      Object.values(Skills).length === initSkills.length
    );
  }

  async addInitialSkills() {
    return Promise.all(
      [
        {
          name: Skills.LEARNING,
          description: SkillsDescription.LEARNING,
          tags: ['memorize', 'memory', 'remember', 'skill'],
          webhook: 'http://localhost:3000/learn',
          schema: learnSchema,
        },
        {
          name: Skills.MEMORY,
          description: SkillsDescription.MEMORY,
          tags: ['memorize', 'memory', 'remember'],
        },
      ].map(async (skill) => {
        const addSkill = new AddSkillHandler(
          skill,
          this.repository,
          this.qdrantClient,
        );
        await addSkill.execute();
      }),
    );
  }
}
