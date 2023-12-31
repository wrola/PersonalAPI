import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Message } from './core/entities/message.entity';
import {
  MESSAGE_REPOSITORY,
  MessagesSqlRepository,
} from './infrastructure/message.repository';
import { QDRANT_CLIENT, initVectorStore } from './infrastructure/qdrant.client';
import { EMBEDDING_PRODUCER } from './infrastructure/embedding.producer';
import { MEMORY_SERVICE, MemoryService } from './memory.service';
import {
  MEMORY_REPOSITORY,
  MemorySqlRepository,
} from './infrastructure/memory.repository';
import { Memory } from './core/entities/memory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Memory]), ConfigModule],
  providers: [
    {
      provide: MESSAGE_REPOSITORY,
      useClass: MessagesSqlRepository,
    },
    {
      provide: QDRANT_CLIENT,
      useFactory: async (configService) => {
        const qdrantClient = new QdrantClient({
          url: configService.get('QDRANT_URL'),
        });

        await initVectorStore(qdrantClient);
        return qdrantClient;
      },
      inject: [ConfigService],
    },
    {
      provide: MEMORY_REPOSITORY,
      useClass: MemorySqlRepository,
    },
    {
      provide: EMBEDDING_PRODUCER,
      useFactory: () => {
        return new OpenAIEmbeddings({ maxConcurrency: 5 });
      },
    },
    {
      provide: MEMORY_SERVICE,
      useClass: MemoryService,
    },
  ],
  exports: [MESSAGE_REPOSITORY, MEMORY_SERVICE, QDRANT_CLIENT],
})
export class MemoryModule {}
