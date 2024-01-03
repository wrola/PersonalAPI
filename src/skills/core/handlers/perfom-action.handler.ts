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
import {
  BaseMessageChunk,
  HumanMessage,
  SystemMessage,
} from 'langchain/schema';
import { currentDate } from '../../../conversation/conversation.service';

export class PerformAction implements SkillHandler {
  constructor(
    readonly payload: Record<string, unknown>,
    @Inject(QDRANT_CLIENT) private qdrantClient: IQdrantClient,
    @Inject(SKILLS_REPOSITORY) private skillsRepository: ISkillsRepository,
    @Inject(MEMORY_SERVICE) private memoryService: IMemoryService,
  ) {}
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

    const skill = await this.skillsRepository.findOne(uuid);

    if (!skill) {
      Logger.error('No such action', `The action uuid not exists: ${uuid}`);
    }

    Logger.log(`Action found, the skill selected: ${skill.name}`);

    const messages = [
      new SystemMessage(`As Alice execute the following action: """${
        skill.name
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

    if (skill.schema) {
      chat.bind({
        functions: [skill.schema],
        function_call: { name: skill.name } || undefined,
      });
    }

    const content = await chat.invoke(messages);
    const result = this._parseFunctionCall(content);

    if (skill.webhook && result.args) {
      try {
        const response = await fetch(skill.webhook, {
          method: 'POST',
          body: JSON.stringify(result.args),
          headers: { 'Content-Type': 'application/json' },
        });

        Logger.log({ action: skill.name, data: response.json() });
      } catch {
        Logger.error({
          action: skill.name,
          data: 'Remote action failed.',
          status: 'error',
        });
      }
    }

    Logger.log({
      action: skill.name,
      data: 'Memory added',
      status: 'success',
    });
  }

  private _parseFunctionCall = (
    result: BaseMessageChunk,
  ): { name: string; args: any } | null => {
    if (result?.additional_kwargs?.function_call === undefined) {
      return null;
    }

    return {
      name: result.additional_kwargs.function_call.name,
      args: JSON.parse(result.additional_kwargs.function_call.arguments),
    };
  };
}
