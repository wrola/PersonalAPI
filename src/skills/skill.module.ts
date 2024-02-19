import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoryModule } from '../memory/memory.module';
import {
  SKILLS_REPOSITORY,
  SkillsRepository,
} from './infrastrucutre/skills.repository';
import { SKILLS_SEED_SERVICE, SkillSeedService } from './skills.seed';
import { Skill } from './core/skill.entity';
import { QDRANT_CLIENT } from '../memory/infrastructure/qdrant.client';
import {
  PERFORM_ACTION,
  PerformAction,
} from './core/handlers/perfom-action.handler';

@Module({
  imports: [MemoryModule, TypeOrmModule.forFeature([Skill])],
  providers: [
    {
      provide: SKILLS_REPOSITORY,
      useClass: SkillsRepository,
    },
    {
      provide: SKILLS_SEED_SERVICE,
      useClass: SkillSeedService,
    },
    {
      provide: PERFORM_ACTION,
      useClass: PerformAction,
    },
  ],
  exports: [PERFORM_ACTION],
})
export class SkillModule {}
