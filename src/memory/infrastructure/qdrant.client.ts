import { Logger } from "@nestjs/common";

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
  const result = await qdrant.getCollections();
  const indexed = result.collections.find(
    (collection) => collection.name === MEMORIES,
  );
  if (!indexed) {
    await qdrant.createCollection(MEMORIES, {
      vectors: { size: 1536, distance: 'Cosine', on_disk: true },
    });
  }
};
export const MEMORIES = 'memories';
