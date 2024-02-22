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
import { Inject, Logger } from '@nestjs/common';
import {
  BaseMessageChunk,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { currentDate } from '../../../conversation/conversation.service';
import { Document } from '@langchain/core/documents';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class PerformActionCommand implements ICommand {
  constructor(
    public readonly query: string,
    public readonly memories: Array<Document>,
  ) {}
}

@CommandHandler(PerformActionCommand)
export class PerformActionHandler
  implements ICommandHandler<PerformActionCommand>
{
  constructor(
    @Inject(QDRANT_CLIENT) private qdrantClient: IQdrantClient,
    @Inject(SKILLS_REPOSITORY) private skillsRepository: ISkillsRepository,
    @Inject(MEMORY_SERVICE) private memoryService: IMemoryService,
  ) {}

  async execute(command: PerformActionCommand): Promise<void> {
    const { query, memories } = command;
    const embedding = await this.memoryService.getEmebed(query as string);
    const actions = await this.qdrantClient.search(ACTIONS, {
      vector: embedding,
      limit: 5,
    });

    const uuid = await this.memoryService.plan(
      query as string,
      actions,
      memories,
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
          memories && memories.length
            ? memories.map((doc: any) => doc.payload.pageContent).join('\n\n')
            : ''
        }###

        Facts:
        - Current date and time: ${currentDate()}`),
      new HumanMessage(query as string),
    ];

    const chat = skill.schema
      ? new ChatOpenAI({ modelName: 'gpt-4' }).bind({
          functions: [skill.schema],
          function_call: { name: skill.name },
        })
      : new ChatOpenAI({ modelName: 'gpt-4' });

    const content = await chat.invoke(messages);
    const result = this._parseFunctionCall(content);

    if (skill.webhook) {
      try {
        const body = JSON.stringify(result.args);
        const response = await fetch(skill.webhook, {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': JSON.parse(process.env.API_KEYS)[0], // TODO remove
          },
        });

        Logger.log(`The result of ${skill.name}, is   ${response.status}`);
        return;
      } catch (err) {
        Logger.error(
          `the action: ${skill.name}, Remote action failed. with error status: ${err.status}`,
        );
      }
    }
  }

  private _parseFunctionCall = (
    result: BaseMessageChunk,
  ): { name: string; args: any } | null => {
    if (result?.additional_kwargs?.function_call === undefined) {
      return {
        args: result.content,
        name: null,
      };
    }

    return {
      name: result.additional_kwargs.function_call.name,
      args: {
        ...JSON.parse(result.additional_kwargs.function_call.arguments),
        reflection: 'self-reflection',
      },
    };
  };
}
