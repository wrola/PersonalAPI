import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  ACTIONS,
  IQdrantClient,
  QDRANT_CLIENT,
} from '../../../memory/infrastructure/qdrant.client';
import { IMemoryService, MEMORY_SERVICE } from '../../../memory/memory.service';
import {
  ISkillsRepository,
  SKILLS_REPOSITORY,
} from '../../infrastrucutre/skills.repository';
import { SkillHandler } from './skill.handler';
import { Inject, Logger } from '@nestjs/common';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { currentDate } from '../../../conversation/conversation.service';

export class PerformAction implements SkillHandler {
  constructor(
    @Inject(QDRANT_CLIENT) private qdrantClient: IQdrantClient,
    @Inject(SKILLS_REPOSITORY) private skillsRepository: ISkillsRepository,
    @Inject(MEMORY_SERVICE) private memoryService: IMemoryService,
  ) {}
  payload: Record<string, unknown>;
  async execute(): Promise<void> {
    const { embedding, query, context } = this.payload;
    const actions = await this.qdrantClient.search(ACTIONS, {
      vector: embedding,
      limit: 1,
      filter: {
        must: [
          {
            key: 'source',
            match: {
              value: ACTIONS,
            },
          },
        ],
      },
    });

    const uuid = await this.memoryService.plan(
      query as string,
      actions as any[],
      context as any,
    );

    const action = await this.skillsRepository.findOne(uuid);

    if (!action) {
      Logger.error('No such action', `The action uuid not exists: ${uuid}`);
    }

    Logger.log(`Action found, the skill selected: ${action.name}`);

    const messages = [
      new SystemMessage(`As Alice execute the following action: """${
        action.name
      }""" based on what user asks and context below.
        context###${(context as any)
          .map((doc: any) => doc[0].pageContent)
          .join('\n\n')}###

        Facts:
        - Current date and time: ${currentDate()}`),
      new HumanMessage(query as string),
    ];

    const chat = new ChatOpenAI({
      modelName: 'gpt-4-1106-preview',
      temperature: 0.7,
    });

    // const { content } = await chat.call(messages).bind({
    //   functions: [...action.schema],
    //   function_call: { name: actions.defaultSchema } || undefined,
    // });
    // return {
    //   content,
    // };
  }
}
