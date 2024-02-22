import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoryModule } from '../memory/memory.module';
import {
  SKILLS_REPOSITORY,
  SkillsRepository,
} from './infrastrucutre/skills.repository';
import { SKILLS_SEED_SERVICE, SkillSeedService } from './skills.seed';
import { Skill } from './core/skill.entity';
import { PerformActionHandler } from './core/commands/perform-action.command';
import { AddSkillHandler } from './core/commands/add-skill.command';

const CommandHandlers = [PerformActionHandler, AddSkillHandler];

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
    ...CommandHandlers,
  ],
  exports: [],
})
export class SkillModule {}
