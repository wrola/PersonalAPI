import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConversationModule } from './conversation/conversation.module';
import { HealthModule } from './health/health.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Message } from './memory/core/entities/message.entity';
import { Memory } from './memory/core/entities/memory.entity';
import { MemoryModule } from './memory/memory.module';
import { SkillModule } from './skills/skill.module';
import { Skill } from './skills/core/skill.entity';
import path = require('path');

@Module({
  imports: [
    SkillModule,
    MemoryModule,
    ConversationModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        <TypeOrmModuleOptions>{
          type: configService.get('DATABASE_TYPE'),
          host: configService.get('POSTGRES_HOST'),
          port: configService.get('POSTGRES_PORT'),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          entities: [Message, Memory, Skill],
          migrationsRun: true,
          migrations: [path.join(__dirname, 'migration', '*{.ts,.js}')],
          cli: { migrationsDir: path.join(__dirname, 'migration') },
        },
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
