import { Module } from '@nestjs/common';
import {
  SKILL_HANDLER_FACTORY,
  SkillHandlerFactory,
} from './core/skill.factory';
import { MemoryModule } from '../memory/memory.module';
import { AddMemoryHandler } from './core/handlers/add-memory.handler';
import { MEMORY_SERVICE } from '../memory/memory.service';
import {
  SKILLS_REPOSITORY,
  SkillsRepository,
} from './infrastrucutre/skills.repository';

const HANDLERS = [AddMemoryHandler];

@Module({
  imports: [MemoryModule],
  providers: [
    {
      provide: SKILL_HANDLER_FACTORY,
      useFactory: (memoryService, skillRepository) => {
        return new SkillHandlerFactory(memoryService, skillRepository);
      },
      inject: [MEMORY_SERVICE, SKILLS_REPOSITORY],
    },
    {
      provide: SKILLS_REPOSITORY,
      useClass: SkillsRepository,
    },
    ...HANDLERS,
  ],
  exports: [],
})
export class SkillModule {}
