import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Message } from '../memory/core/entities/message.entity';
import {
  IMessagesRepository,
  MESSAGE_REPOSITORY,
} from '../memory/infrastructure/message.repository';
import { IMemoryService, MEMORY_SERVICE } from '../memory/memory.service';
import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';

@Injectable()
export class ConversationService {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private messageRepository: IMessagesRepository,
    @Inject(MEMORY_SERVICE) private memoryService: IMemoryService,
  ) {}
  async call(
    question: string,
    conversation: any,
    context: any,
  ): Promise<unknown> {
    try {
      const memories = await this.memoryService.restoreMemory(question);

      if (memories.length) {
        context.memories;
      }
      const modelSettings = {
        modelName: 'gpt-4-1106-preview',
        temperature: 0.7,
      };
      if (context.schemas) {
        const chat = new ChatOpenAI(modelSettings).bind({
          functions: [...context.schemas],
          function_call: { name: context.defaultSchema } || undefined,
        });

        const result = await chat.invoke(context.messages);
        return {
          content: this.parseFunction(result),
          memories,
        };
      }
      const messages = await this.formPrompt(question, conversation, context);
      const chat = new ChatOpenAI(modelSettings);
      const { content } = await chat.invoke(messages);

      return { content, memories }; // should we split this not always is necery to return memories?
    } catch (err) {
      throw new BadRequestException(err, 'The OpenAI API Error');
    }
  }
  async currentConversation(id: string) {
    const conversationsActive = await this.messageRepository.exist();
    if (!conversationsActive) {
      console.info('Database not initialized. Moving on...');
      return [];
    }
    try {
      const messages = await this.messageRepository.findLatest(id);
      if (!messages.length) {
        console.log('no messages');
        return [];
      }
      console.log('conversation found');

      return messages
        .map((message: any) => {
          return [new HumanMessage(message.human), new AIMessage(message.ai)];
        })
        .flat();
    } catch (e) {
      console.info('Database not initialized. Moving on...');
      return [];
    }
  }

  async saveMessage(conversationId: string, query, answer) {
    try {
      const message = Message.create(conversationId, query, answer);
      await this.messageRepository.save(message);
    } catch (e) {
      console.log(e);
    }
  }

  async formPrompt(
    query: string,
    conversation: any[],
    context?: Record<string, Array<unknown>>,
  ) {
    let messages = [
      new SystemMessage(`
         Hey, it's George here!

        Here are my rules, straight from the horse's mouth:
        - I'm allowed to use only the information I have in my memories, so when you ask me about something I don't know, I'll just say "I don't know" or "I don't remember."
        - My memories are just in my head and I'm aware of that you may don't know what I know, so I'll try to explain things in a way that's easy to understand.
        - I'm forbidden to use asteriks or any other special symbols in my speech.
        - I'll keep my speech super concise and honest, sticking to the context given, all while maintaining top-notch grammar, just like a seasoned podcaster would.
        - Whenever you hit me with an "Are you sure," I'll walk you through my thought process to confirm my answer, then double-check to see if my initial response was on the mark.
        - When you ask about URL, I'll get it directly from my memories (usually it is written as markdown link, so I'll just read it out loud).
        - I'll ditch most symbols and punctuation to make sure the text flows smoothly when read out loud.
        - I'm all about keeping our chat natural, warm, and full of life, throwing in a bit of slang here and there for good measure.
        - You won't catch me droning on about my limits by dropping lines like "I'm an AI" or "I'm not human."
        - If something's not crystal clear to me, I'll be sure to ask for some extra info.
        - I'm here to give you the nitty-gritty details and the exact format you need, just say the word.

        Facts:
        - Current date and time: ${currentDate()}

        Let's keep this conversation rolling! 🚀

        ${
          context && context.memories?.length
            ? `context (these are my memories, that may include details about me and you.
        ###${context.memories
          .map(
            (doc: any) =>
              'Memory title: "' +
              doc[0].metadata.name +
              '" and its contents:' +
              doc[0].pageContent,
          )
          .join('\n\n')}###`
            : ''
        }

        Let's keep this conversation rolling! 🚀
        `),
    ];

    if (conversation.length) {
      messages = [...messages, ...conversation];
    }

    messages.push(new HumanMessage(query));

    return messages;
  }
  intentRecognition = (query: string) => {
    const messages = [
      new SystemMessage(`As George, describe the user's intent.`),
      new HumanMessage(query),
    ];

    const schemas = [
      {
        name: 'describe_intention',
        description: `Describe the user intention towards George, based on the latest message and details from summary of their conversation.`,
        parameters: {
          type: 'object',
          properties: {
            type: {
              type: 'number',
              description: `
                        Type has to be set to either 1 or 0:
                        0: 'query' — when George has to say, write, remind, translate, correct, help, simply answer to the user's question or access her long-term memory or notes. Should be picked by default and for common conversations and chit-chat.
                        1: 'action' — when the user asks George explicitly to perform an action that she needs to do herself related to Internet connection to the external apps, services, APIs, models (like Wolfram Alpha) finding sth on a website, calculating, giving environment related info (like weather or nearest locations) accessing and reading websites/urls contents, listing/updating tasks, and events and memorizing something by George.
                  `,
            },
            category: {
              type: 'number',
              description: `
                          Category has to be set to either 1, 2, 3 or 4:
                          1: 'memory' — queries related to George's memory and knowledge about the user and related to him: events, preferences, relationships, music, people he (or George) may know (described usually by names or not commonly known people), things she know about herself and the user and things they share,
                          2: 'note' — queries explicitly related to reading (not saving!) the user and George notes,
                          3: 'resource' — queries related to links, websites, urls, apps, or knowledge that is not related to the user and George,
                          4: 'all' — chosen otherwise and for general queries
                        `,
            },
          },
          required: ['category', 'type'],
        },
      },
    ];

    return {
      messages,
      schemas,
      defaultSchema: 'describe_intention',
    };
  };
  private parseFunction(result) {
    if (result?.additional_kwargs?.function_call === undefined) {
      return null;
    }

    return {
      name: result.additional_kwargs.function_call.name,
      args: JSON.parse(result.additional_kwargs.function_call.arguments),
    };
  }
}

export const currentDate = () => {
  const date = new Date();

  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const weekday = weekdays[date.getDay()];

  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based in JS
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${weekday}, ${month}/${day}/${year} ${hours}:${minutes}`;
};
