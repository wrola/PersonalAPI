import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationController } from './api/conversation.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MemoryModule } from '../memory/memory.module';
import { MESSAGE_REPOSITORY } from '../memory/infrastructure/message.repository';

@Module({
  imports: [ConfigModule, MemoryModule],
  controllers: [ConversationController],
  providers: [
    {
      provide: ConversationService,
      useFactory: async (configService, messageRepository) => {
        const model = new ChatOpenAI({
          modelName: <string>configService.get('OPEN_MODEL'),
        });
        return new ConversationService(model, messageRepository);
      },
      inject: [ConfigService, MESSAGE_REPOSITORY],
    },
  ],
})
export class ConversationModule {}
