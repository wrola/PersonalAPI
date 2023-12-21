import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './api/conversation.controller';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [MemoryModule],
  controllers: [ConversationController],
  providers: [
    {
      provide: ConversationService,
      useClass: ConversationService,
    },
  ],
})
export class ConversationModule {}
