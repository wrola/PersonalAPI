import { Module } from '@nestjs/common';
import { ConversationService } from './Conversation.service';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationController } from './api/Conversation.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ConversationController],
  providers: [
    {
      provide: ConversationService,
      useFactory: (configService) => {
        const model = new ChatOpenAI({
          modelName: <string>configService.get('OPEN_MODEL'),
        });
        return new ConversationService(model);
      },
      inject: [ConfigService],
    },
  ],
})
export class ConversationModule {}
