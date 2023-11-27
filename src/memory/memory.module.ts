import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './core/entities/message.entity';
import {
  MESSAGE_REPOSITORY,
  MessagesSqlRepository,
} from './infrastructure/message.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [
    {
      provide: MESSAGE_REPOSITORY,
      useClass: MessagesSqlRepository,
    },
  ],
  exports: [MESSAGE_REPOSITORY],
})
export class MemoryModule {}
