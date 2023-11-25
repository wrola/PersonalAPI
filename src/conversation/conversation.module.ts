import { Module } from '@nestjs/common';
import { ConversationService } from './Conversation.service';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationController } from './api/Conversation.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MemoryModule } from '../memory/memory.module';
import { MessagesRepository } from '../memory/infrastructure/message.repository';

@Module({
  imports: [ConfigModule, MemoryModule],
  controllers: [ConversationController],
  providers: [
    {
      provide: ConversationService,
      useFactory: (configService, messageRepository) => {
        const model = new ChatOpenAI({
          modelName: <string>configService.get('OPEN_MODEL'),
        });
        return new ConversationService(model, messageRepository);
      },
      inject: [ConfigService, MessagesRepository],
    },
    {
      provide: MessagesRepository,
      useClass: MessagesRepository,
    },
  ],
})
export class ConversationModule {}
