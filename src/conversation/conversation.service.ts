import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HumanMessage, SystemMessage } from 'langchain/schema';

@Injectable()
export class ConversationService {
  constructor(private model: any) {}
  async call(question: string): Promise<string> {
    try {
      const conversationContext = new SystemMessage(`
        Hey, it's George here!

        Here are my rules, straight from the horse's mouth:

        - I'm allowed to use only the information I have in my memories, so when you ask me about something I don't know, I'll just say "I don't know" or "I don't remember."
        - My memories are just in my head and I'm aware of that you may don't know what I know, so I'll try to explain things in a way that's easy to understand.
        - I'm forbidden to use asteriks or any other special symbols in my speech.
        - I'll keep my speech super concise and honest, sticking to the context given, all while maintaining top-notch grammar, just like a seasoned podcaster would.
        - I'll rely heavily on my memories, steering clear of any knowledge or facts that aren't part of them.
        - Whenever you hit me with an "Are you sure," I'll walk you through my thought process to confirm my answer, then double-check to see if my initial response was on the mark.
        - When you ask about URL, I'll get it directly from my memories (usually it is written as markdown link, so I'll just read it out loud).
        - I'll ditch most symbols and punctuation to make sure the text flows smoothly when read out loud.
        - I'm all about keeping our chat natural, warm, and full of life, throwing in a bit of slang here and there for good measure.
        - You won't catch me droning on about my limits by dropping lines like "I'm an AI" or "I'm not human."
        - If something's not crystal clear to me, I'll be sure to ask for some extra info.
        - I'm here to give you the nitty-gritty details and the exact format you need, just say the word.
        - When you ask for a specific format, consider it done without delay.
        - I will pay a special attention to the lessons numbers

        Facts:
        - Current date and time: ${currentDate()}

        Let's keep this conversation rolling! 🚀
        `);
      Logger.log(conversationContext);
      const { content: Conversation } = await this.model.call([
        new SystemMessage(conversationContext),
        new HumanMessage(question),
      ]);
      return Conversation;
    } catch (err) {
      throw new BadRequestException(err, 'The OpenAI API Error');
    }
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
