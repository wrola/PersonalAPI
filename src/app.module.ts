import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnswerModule } from './answer/answer.module';

@Module({
  imports: [AnswerModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
