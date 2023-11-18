import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnswerModule } from './answer/answer.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [AnswerModule, ConfigModule.forRoot(), HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
