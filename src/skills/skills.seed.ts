import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { ISkillsRepository } from './infrastrucutre/skills.repository';
import { Skill } from './core/skill.entity';
import { Skills, SkillsDescription } from './core/skills';
import { AddSkillHandler } from './core/handlers/add-skill.handler';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IQdrantClient,
  QDRANT_CLIENT,
} from '../memory/infrastructure/qdrant.client';
import { learnSchema } from './core/schemas/learn-schema';

export const SKILLS_SEED_SERVICE = Symbol('SKILLS_SEED_SERVICE');

@Injectable()
export class SkillSeedService {
  constructor(
    @InjectRepository(Skill) private repository: ISkillsRepository,
    @Inject(QDRANT_CLIENT) private qdrantClient: IQdrantClient,
  ) {}

  async initializeSkills() {
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
    const [learnSkill, memorySkill] = [
      new AddSkillHandler(this.repository, this.qdrantClient),
      new AddSkillHandler(this.repository, this.qdrantClient),
    ];

    learnSkill.setPayload({
      name: Skills.LEARNING,
      description: SkillsDescription.LEARNING,
      tags: ['memorize', 'memory', 'learn', 'skill'],
      webhook: 'http://localhost:3000/learn',
      id: '8df3d811-d459-4880-b651-7c4d4836b029',
    });
    memorySkill.setPayload({
      name: Skills.MEMORY,
      description: SkillsDescription.MEMORY,
      tags: ['memorize', 'memory', 'remember'],
      webhook: 'http://localhost:3000/memories',
      id: '62075b91-d895-4e61-8a4c-b8b89ff909fb',
      schema: learnSchema,
    });

    return Promise.all(
      [learnSkill, memorySkill].map(async (skill) => {
        await skill.execute();
      }),
    );
  }
}
