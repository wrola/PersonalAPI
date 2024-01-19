import { ChatOpenAI } from '@langchain/openai';
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
} from '@langchain/core/messages';
import { currentDate } from '../../../conversation/conversation.service';

export class PerformAction implements SkillHandler {
  payload: Record<string, unknown>;

  constructor(
    @Inject(QDRANT_CLIENT) private qdrantClient: IQdrantClient,
    @Inject(SKILLS_REPOSITORY) private skillsRepository: ISkillsRepository,
    @Inject(MEMORY_SERVICE) private memoryService: IMemoryService,
  ) {}
  setPayload(payload: Record<string, unknown>): void {
    this.payload = payload;
  }
  async execute(): Promise<void> {
    if (!this.payload) {
      throw new Error('There is no payload');
    }

    const { query, memories } = this.payload;
    const embedding = await this.memoryService.getEmebed(query as string);
    const actions = await this.qdrantClient.search(ACTIONS, {
      vector: embedding,
      limit: 5,
    });

    const uuid = await this.memoryService.plan(
      query as string,
      actions as any[],
      memories as any[],
    );

    const skill = await this.skillsRepository.findOne(uuid);

    if (!skill) {
      Logger.error('No such action', `The action uuid not exists: ${uuid}`);
    }

    Logger.log(`Action found, the skill selected: ${skill.name}`);

    const messages = [
      new SystemMessage(`As George execute the following action: """${
        skill.name
      }""" based on what user asks and context below.
        context###
        ${
          (memories as any[]) && (memories as any[]).length
            ? (memories as any[])
                .map((doc: any) => doc[0].pageContent)
                .join('\n\n')
            : ''
        }###

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

        Logger.log(`The result of ${skill.name}, is   ${response.json()}`);
      } catch (err) {
        Logger.error(
          `the action: ${skill.name}, Remote action failed. with error status: ${err.status}`,
        );
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

export const PERFORM_ACTION = Symbol('PERFORM_ACTION');
