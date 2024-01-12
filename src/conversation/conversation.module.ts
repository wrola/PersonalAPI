import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './api/conversation.controller';
import { MemoryModule } from '../memory/memory.module';
import { SkillModule } from '../skills/skill.module';

@Module({
  imports: [MemoryModule, SkillModule],
  controllers: [ConversationController],
  providers: [
    {
      provide: ConversationService,
      useClass: ConversationService,
    },
  ],
})
export class ConversationModule {}
