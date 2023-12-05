import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationController } from './api/conversation.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MemoryModule } from '../memory/memory.module';
import { MESSAGE_REPOSITORY } from '../memory/infrastructure/message.repository';
import { MEMORY_SERVICE } from '../memory/memory.service';

@Module({
  imports: [ConfigModule, MemoryModule],
  controllers: [ConversationController],
  providers: [
    {
      provide: ConversationService,
      useFactory: async (configService, messageRepository, memoryService) => {
        const model = new ChatOpenAI({
          modelName: <string>configService.get('OPEN_MODEL'),
        });
        return new ConversationService(model, messageRepository, memoryService);
      },
      inject: [ConfigService, MESSAGE_REPOSITORY, MEMORY_SERVICE],
    },
  ],
})
export class ConversationModule {}
