import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { AnswerController } from './api/answer.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AnswerController],
  providers: [
    {
      provide: AnswerService,
      useFactory: (configService) => {
        const model = new ChatOpenAI({
          modelName: <string>configService.get('OPEN_MODEL'),
        });
        return new AnswerService(model);
      },
      inject: [ConfigService],
    },
  ],
})
export class AnswerModule {}
