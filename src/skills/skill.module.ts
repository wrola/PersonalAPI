import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SKILL_HANDLER_FACTORY,
  SkillHandlerFactory,
} from './core/skill.factory';
import { MemoryModule } from '../memory/memory.module';
import { MEMORY_SERVICE } from '../memory/memory.service';
import {
  SKILLS_REPOSITORY,
  SkillsRepository,
} from './infrastrucutre/skills.repository';
import {
  SKILLS_SEED_SERVICE,
  SkillSeedService,
} from './infrastrucutre/skills.seed';
import { Skill } from './core/skill.entity';
import { SkillsController } from './api/skills.controller';

@Module({
  imports: [MemoryModule, TypeOrmModule.forFeature([Skill])],
  providers: [
    {
      provide: SKILLS_REPOSITORY,
      useClass: SkillsRepository,
    },
    {
      provide: SKILL_HANDLER_FACTORY,
      useFactory: (memoryService, skillRepository) => {
        return new SkillHandlerFactory(memoryService, skillRepository);
      },
      inject: [MEMORY_SERVICE, SKILLS_REPOSITORY],
    },
    {
      provide: SKILLS_SEED_SERVICE,
      useFactory: async (skillsRepository) => {
        const skillSeed = new SkillSeedService(skillsRepository);
        await skillSeed.initializeSkills();

        return skillSeed;
      },
      inject: [SKILLS_REPOSITORY, MEMORY_SERVICE],
    },
  ],
  controllers: [SkillsController],
  exports: [],
})
export class SkillModule {}
