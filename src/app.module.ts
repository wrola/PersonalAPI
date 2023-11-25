import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConversationModule } from './conversation/conversation.module';
import { HealthModule } from './health/health.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from './database/config';
import { getMetadataArgsStorage } from 'typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConversationModule,
    ConfigModule.forRoot(),
    HealthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        config.type = configService.get('DATABASE_TYPE');
        config.host = configService.get('DATABASE_HOST');
        config.port = configService.get('DATABASE_PORT');
        config.username = configService.get('DATABASE_USER');
        config.password = configService.get('DATABASE_PASSWORD');
        config.entities = getMetadataArgsStorage().tables.map(
          (tbl) => tbl.target,
        ) as string[];
        config.migrationsRun =
          configService.get('DATABASE_RUN_MIGRATIONS') === 'true';
        return <TypeOrmModuleOptions>{ ...config, autoloadEntities: true };
      },
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
