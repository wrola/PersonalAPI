import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import {
  IQdrantClient,
  MEMORIES,
  QDRANT_CLIENT,
} from '../../infrastructure/qdrant.client';
import {
  IMemoryRepository,
  MEMORY_REPOSITORY,
} from '../../infrastructure/memory.repository';
import {
  EMBEDDING_PRODUCER,
  IEmbeddingProducer,
} from '../../infrastructure/embedding.producer';
import { Inject } from '@nestjs/common';
import { Memory } from '../entities/memory.entity';
import { Document } from '@langchain/core/documents';

export class AddMemoryCommand implements ICommand {
  constructor(
    public readonly content: string,
    public readonly name: string,
    public readonly tags: Array<string>,
    public readonly reflection?: string,
    public readonly id?: string,
  ) {}
}

@CommandHandler(AddMemoryCommand) // make it into return DTO?
export class AddMemoryCommandHandler
  implements ICommandHandler<AddMemoryCommand, Memory>
{
  constructor(
    @Inject(MEMORY_REPOSITORY)
    private memoryRepository: IMemoryRepository,
    @Inject(QDRANT_CLIENT)
    private qdrantClient: IQdrantClient,
    @Inject(EMBEDDING_PRODUCER)
    private embeddingProducer: IEmbeddingProducer,
  ) {}
  async execute(command: AddMemoryCommand): Promise<any> {
    const newMemory = Memory.create(command);
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

    await Promise.all([
      this.memoryRepository.save(newMemory),
      this.qdrantClient.upsert(MEMORIES, {
        wait: true,
        batch: {
          ids: [documentedMemory.metadata.uuid],
          vectors: [embedding],
          payloads: [documentedMemory],
        },
      }),
    ]);

    return newMemory;
  }
}
