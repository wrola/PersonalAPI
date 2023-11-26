import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (configService) =>
        new AuthGuard(configService.get('API_KEYS')),
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
