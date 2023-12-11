import { Module } from '@nestjs/common';
import {
  SKILL_HANDLER_FACTORY,
  SkillHandlerFactory,
} from './core/skill.factory';

@Module({
  imports: [],
  providers: [
    {
      provide: SKILL_HANDLER_FACTORY,
      useClass: SkillHandlerFactory,
    },
  ],
  exports: [],
})
export class SkillModule {}
