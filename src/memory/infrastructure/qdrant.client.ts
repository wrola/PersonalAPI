import { Document } from '@langchain/core/documents';
import { Logger } from '@nestjs/common';

export const ACTIONS = 'actions';
export const MEMORIES = 'memories';
export const QDRANT_CLIENT = Symbol('QDRANT_CLIENT');

export interface IQdrantClient {
  search(
    collectionName: string,
    data: Record<string, unknown>,
  ): Promise<Array<QdrantDocs>>;
  createCollection(): Promise<unknown>;
  getCollection(): Promise<Record<string, unknown>>;
  upsert(
    collectionName: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
}

export type QdrantDocs = Document & {
  payload: {
    pageContent: string;
    metadata: {
      name: string;
      uuid: string;
    };
  };
};

export const initVectorStore = async (qdrant) => {
  try {
    const result = await qdrant.getCollections();
    const [memories, actions] = result.collections.filter(
      (collection) =>
        collection.name === MEMORIES || collection.name === ACTIONS,
    );

    if (!memories) {
      await qdrant.createCollection(MEMORIES, {
        vectors: { size: 1536, distance: 'Cosine', on_disk: true },
      });
      Logger.log('Memory is ready', 'MEMORY');
    }

    if (!actions) {
      await qdrant.createCollection(ACTIONS, {
        vectors: { size: 1536, distance: 'Cosine', on_disk: true },
      });
      Logger.log('I am ready for learning new skills', 'SKILLS');
    }
  } catch (err) {
    Logger.error(`During qdrant initialization + ${err}`, 'SKILLS');
  }
};
