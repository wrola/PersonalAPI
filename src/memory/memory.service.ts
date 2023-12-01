import { Inject } from '@nestjs/common';
import {
  IMemoryRepository,
  MEMORY_REPOSITORY,
} from './infrastructure/memory.repository';
import { Memory, MemoryInput } from './core/entities/memory.entity';
import { Document } from 'langchain/document';
import {
  IQdrantClient,
  MEMORIES,
  QDRANT_CLIENT,
} from './infrastructure/qdrant.client';
import {
  EMBEDDING_PRODUCER,
  IEmbeddingProducer,
} from './infrastructure/embedding.producer';

export class MemoryService {
  constructor(
    private model: any,
    @Inject(MEMORY_REPOSITORY)
    private memoryRepository: IMemoryRepository,
    @Inject(QDRANT_CLIENT)
    private qdrantClient: IQdrantClient,
    @Inject(EMBEDDING_PRODUCER)
    private embeddingProducer: IEmbeddingProducer,
  ) {}
  async add(memoryInput: MemoryInput): Promise<Memory> {
    const newMemory = Memory.create(memoryInput);
    const documentedMemory = new Document({
      pageContent: newMemory.content,
      metadata: {
        uuid: newMemory.id,
      },
    });
    const [embedding] = await this.embeddingProducer.embedDocuments([
      documentedMemory.pageContent,
    ]);
    if (!embedding) {
      return;
    }
    await Promise.all([
      this.memoryRepository.save(newMemory),
      this.qdrantClient.upsert(MEMORIES, {
        wait: true,
        batch: {
          ids: [documentedMemory.metadata.uuid],
          vectors: [embedding],
          payloads: [documentedMemory.metadata],
        },
      }),
    ]);

    return newMemory;
  }
  async restoreMemory(queryEmbedding): Promise<unknown> {
    return await this.qdrantClient.search(MEMORIES, {
      vector: queryEmbedding,
      limit: 1,
      filter: {
        must: [
          {
            key: 'source',
            match: {
              value: MEMORIES,
            },
          },
        ],
      },
    });
  }
}
