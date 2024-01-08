import { Logger } from '@nestjs/common';

export const ACTIONS = 'actions';
export const MEMORIES = 'memories';
export const QDRANT_CLIENT = Symbol('QDRANT_CLIENT');

export interface IQdrantClient {
  search(
    collectionName: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
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
