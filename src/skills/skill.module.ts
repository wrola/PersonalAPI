import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SKILL_HANDLER_FACTORY,
  SkillHandlerFactory,
} from './core/skill.factory';
import { MemoryModule } from '../memory/memory.module';
import {
  SKILLS_REPOSITORY,
  SkillsRepository,
} from './infrastrucutre/skills.repository';
import { SKILLS_SEED_SERVICE, SkillSeedService } from './skills.seed';
import { Skill } from './core/skill.entity';
import { SkillsController } from './api/skills.controller';
import { QDRANT_CLIENT } from '../memory/infrastructure/qdrant.client';

@Module({
  imports: [MemoryModule, TypeOrmModule.forFeature([Skill])],
  providers: [
    {
      provide: SKILLS_REPOSITORY,
      useClass: SkillsRepository,
    },
    {
      provide: SKILL_HANDLER_FACTORY,
      useClass: SkillHandlerFactory,
    },
    {
      provide: SKILLS_SEED_SERVICE,
      useFactory: async (skillsRepository, qdrantClient) => {
        const skillSeed = new SkillSeedService(skillsRepository, qdrantClient);
        await skillSeed.initializeSkills();

        return skillSeed;
      },
      inject: [SKILLS_REPOSITORY, QDRANT_CLIENT],
    },
  ],
  controllers: [SkillsController],
  exports: [],
})
export class SkillModule {}
