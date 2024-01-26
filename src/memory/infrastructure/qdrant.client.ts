import { Logger } from '@nestjs/common';
import { IMemoryService } from '../memory.service';
import { MemoryInput } from '../core/entities/memory.entity';
import { Document } from '@langchain/core/documents';

export const ACTIONS = 'actions';
export const MEMORIES = 'memories';
export const QDRANT_CLIENT = Symbol('QDRANT_CLIENT');

export interface IQdrantClient {
  search(
    collectionName: string,
    data: Record<string, unknown>,
  ): Promise<Array<Document>>;
  createCollection(): Promise<unknown>;
  getCollection(): Promise<unknown>;
  upsert(
    collectionName: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
}

export const initVectorStore = async (qdrant) => {
  try {
    const result = await qdrant.getCollections();
    const [memories, actions] = result.collections.filter(
      (collection) =>
        collection.name === MEMORIES || collection.name === ACTIONS,
    );

    if (!memories) {
      Logger.log('No memories Honey, creating place for memories', 'SKILLS');
      await qdrant.createCollection(MEMORIES, {
        vectors: { size: 1536, distance: 'Cosine', on_disk: true },
      });
      Logger.log('Memories are initialize', 'SKILLS');
    }
    if (!actions) {
      Logger.log('I cant do shit, no space for actions', 'SKILLS');
      await qdrant.createCollection(ACTIONS, {
        vectors: { size: 1536, distance: 'Cosine', on_disk: true },
      });
      Logger.log('I am not longer handicapped', 'SKILLS');
    }

    Logger.log('Ready for settting up initial skills', 'SKILLS');
  } catch (err) {
    Logger.error(`During qdrant initialization + ${err}`, 'SKILLS');
  }
};

export const loadDefaultMemories = async (memoryService: IMemoryService) => {
  return Promise.all(
    defaulMemories.map(async (memory) => await memoryService.add(memory)),
  );
};

const defaulMemories: Array<MemoryInput> = [
  {
    source: 'Initial Knowledge',
    content:
      "I'm George. The person who is very kind and generous. I'm also very smart and funny.",
    tags: ['self-perception', 'personality', 'self', 'George'],
  },
  {
    content:
      'Wojtek is most common user, that is really happy to talk to you, use skill and knowledge to help him with issues that he raise to you and have fun working together on problems to tackle down',
    tags: ['Wojtek', 'user', 'wojtek'],
    source: 'Initial Knowledge',
  },
];
