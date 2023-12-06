import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './api/conversation.controller';
import { MemoryModule } from '../memory/memory.module';
import { MESSAGE_REPOSITORY } from '../memory/infrastructure/message.repository';
import { MEMORY_SERVICE } from '../memory/memory.service';

@Module({
  imports: [MemoryModule],
  controllers: [ConversationController],
  providers: [
    {
      provide: ConversationService,
      useFactory: async (messageRepository, memoryService) => {
        return new ConversationService(messageRepository, memoryService);
      },
      inject: [MESSAGE_REPOSITORY, MEMORY_SERVICE],
    },
  ],
})
export class ConversationModule {}
