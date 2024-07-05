import { ImATeapotException, Inject, Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  IMemoryRepository,
  MEMORY_REPOSITORY,
} from './infrastructure/memory.repository';
import { Document } from '@langchain/core/documents';
import {
  IQdrantClient,
  MEMORIES,
  QDRANT_CLIENT,
  QdrantDocs,
} from './infrastructure/qdrant.client';
import {
  EMBEDDING_PRODUCER,
  IEmbeddingProducer,
} from './infrastructure/embedding.producer';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { currentDate } from '../conversation/conversation.service';

@Injectable()
export class MemoryService implements IMemoryService {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(MEMORY_REPOSITORY)
    private memoryRepository: IMemoryRepository,
    @Inject(QDRANT_CLIENT)
    private qdrantClient: IQdrantClient,
    @Inject(EMBEDDING_PRODUCER)
    private embeddingProducer: IEmbeddingProducer,
  ) {}

  async restoreMemory(query: string): Promise<Array<Document>> {
    const queryEmbedding = await this.getEmebed(query);
    const documentedMemories = await this.qdrantClient.search(MEMORIES, {
      vector: queryEmbedding,
      limit: 3,
    });
    const rerankMemories = await this.rerank(query, documentedMemories);
    return rerankMemories;
  }
  async getEmebed(query: string): Promise<number[]> {
    return await this.embeddingProducer.embedQuery(query);
  }
  private async rerank(query: string, documents: Array<QdrantDocs>) {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      temperature: 0,
      maxConcurrency: 15,
    });
    Logger.log('Reranking documents...');

    const checks: any = [];
    for (const document of documents) {
      Logger.log('Checking document: ' + document.payload.metadata.name); // should it be a metadata or payload?
      checks.push({
        uuid: document.payload.metadata.uuid,
        rank: model.invoke([
          new SystemMessage(`Check if the following document is relevant to the user query: """${query}""" and may be helpful to answer the question / query. Return 0 if not relevant, 1 if relevant.

                Facts:
                - Current date and time: ${currentDate()}

                Warning:
                 - You're forced to return 0 or 1 and forbidden to return anything else under any circumstances.
                 - Pay attention to the keywords from the query, mentioned links etc.

                 Additional info:
                 - Document title: ${document.payload.metadata.name}

                 Document content: ###${document.payload.pageContent}###

                 Query:
                 `),
          new HumanMessage(query + '### Is relevant (0 or 1):'),
        ]),
      });
    }

    const results = await Promise.all(
      checks.map(async (check: any) => check.rank),
    );
    const rankings = results.map((result, index) => {
      return { uuid: checks[index].uuid, score: result.content };
    });
    Logger.log('Reranked documents.');
    return documents.filter((document: QdrantDocs) =>
      rankings.find(
        (ranking) =>
          ranking.uuid === document.payload.metadata.uuid &&
          ranking.score === '1',
      ),
    );
  }

  async plan(query: string, actions: any[], context: any[]): Promise<string> {
    const model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0,
      maxConcurrency: 1,
    });

    if (!actions.length) {
      new ImATeapotException('No actions possible');
    }

    const { content: uuid } = await model.invoke([
      new SystemMessage(`As George, you need to pick a single action that is the most relevant to the user's query and context below. Your only job is to return UUID of this action and nothing else.
        conversation context###${
          context.length
            ? context.map((doc) => doc.payload.pageContent).join('\n\n')
            : ''
        }###
        available actions###${actions
          .map((action) => `(${action.id}) + ${action.payload.pageContent}`)
          .join('\n\n')}###
        `),
      new HumanMessage(query + '### Pick an action (UUID): '),
    ]);

    return uuid as string;
  }

  async isMemoryReady(): Promise<boolean> {
    const collectionsState = await this.qdrantClient.getCollection();

    return collectionsState.status === 'ok';
  }
}

export const MEMORY_SERVICE = Symbol('MEMORY_SERVICE');

export interface IMemoryService {
  getEmebed(query: string): Promise<number[]>;
  restoreMemory(queryEmbedding): Promise<Array<unknown>>;
  plan<T, K>(
    query: string,
    actions: Array<T>,
    context: Array<K>,
  ): Promise<string>;
  isMemoryReady(): Promise<boolean>;
}
