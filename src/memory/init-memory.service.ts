import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Memory, MemoryInput } from './core/entities/memory.entity';
import {
  IMemoryRepository,
  MEMORY_REPOSITORY,
} from './infrastructure/memory.repository';
import {
  IQdrantClient,
  MEMORIES,
  QDRANT_CLIENT,
} from './infrastructure/qdrant.client';
import {
  EMBEDDING_PRODUCER,
  IEmbeddingProducer,
} from './infrastructure/embedding.producer';
import { Document } from '@langchain/core/documents';

export const INIT_MEMORY = Symbol('INITIAL_MEMORY');
@Injectable()
export class InitialMemory implements OnModuleInit {
  constructor(
    @Inject(MEMORY_REPOSITORY)
    private memoryRepository: IMemoryRepository,
    @Inject(QDRANT_CLIENT)
    private qdrantClient: IQdrantClient,
    @Inject(EMBEDDING_PRODUCER)
    private embeddingProducer: IEmbeddingProducer,
  ) {}
  async onModuleInit() {
    await Promise.all(
      defaultMemories.map(async (defaultMemory) => {
        const newMemory = Memory.create(defaultMemory);
        const documentedMemory = new Document({
          pageContent: newMemory.content,
          metadata: {
            uuid: newMemory.id,
            name: newMemory.name,
          },
        });
        const [embedding] = await this.embeddingProducer.embedDocuments([
          documentedMemory.pageContent,
        ]);
        if (!embedding) {
          return;
        }
        await this.memoryRepository.save(newMemory),
          await this.qdrantClient.upsert(MEMORIES, {
            wait: true,
            batch: {
              ids: [documentedMemory.metadata.uuid],
              vectors: [embedding],
              payloads: [documentedMemory],
            },
          });
      }),
    );
    await Logger.log('Init memories added');
  }

  // async load() {
  //   const { content, name, tags, reflection, id } = defaultMemories[0];
  //   this.commandBus.execute(
  //     new AddMemoryCommand(content, name, tags, reflection, id),
  //   ),
  //     await Logger.log('Init memories added');
  // }
}
export const defaultMemories: Array<MemoryInput> = [
  {
    name: 'George',
    content:
      "I'm George. The person who is very kind and generous. I'm also very smart and funny.",
    tags: ['self-perception', 'personality', 'self', 'George'],
    id: 'b6e33182-9efa-4ecd-9b39-c74acdc1b853',
    reflection: 'self',
  },
  {
    name: 'Wojtek',
    content:
      'Wojtek is most common user, that is really happy to talk to you, use skill and knowledge to help him with issues that he raise to you and have fun working together on problems to tackle down',
    tags: ['Wojtek', 'user', 'wojtek'],
    id: 'e66f582c-058b-49bc-95ca-350f7aa951ee',
    reflection: 'self',
  },
];
