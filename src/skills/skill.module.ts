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
import { QDRANT_CLIENT } from '../memory/infrastructure/qdrant.client';
import { QdrantClient } from '@qdrant/js-client-rest';

@Module({
  imports: [MemoryModule, TypeOrmModule.forFeature([Skill])],
  providers: [
    {
      provide: SKILLS_REPOSITORY,
      useClass: SkillsRepository,
    },
    {
      provide: SKILL_HANDLER_FACTORY,
      useFactory: (memoryService, skillRepository, qdrantClient) => {
        return new SkillHandlerFactory(
          memoryService,
          skillRepository,
          qdrantClient,
        );
      },
      inject: [MEMORY_SERVICE, SKILLS_REPOSITORY, QDRANT_CLIENT],
    },
    {
      provide: SKILLS_SEED_SERVICE,
      useFactory: async (skillsRepository, qdrantClient) => {
        const skillSeed = new SkillSeedService(skillsRepository, qdrantClient);
        await skillSeed.initializeSkills();

        return skillSeed;
      },
      inject: [SKILLS_REPOSITORY, MEMORY_SERVICE, QDRANT_CLIENT],
    },
  ],
  controllers: [SkillsController],
  exports: [],
})
export class SkillModule {}
