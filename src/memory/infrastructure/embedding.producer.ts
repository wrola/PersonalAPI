export const EMBEDDING_PRODUCER = Symbol('EmbeddingProducer');

export interface IEmbeddingProducer {
  embedDocuments(docs: Array<string>): Promise<number[][]>;
  embedQuery(query: string): Promise<number[]>;
}
