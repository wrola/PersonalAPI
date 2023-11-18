import { BadRequestException, Injectable } from '@nestjs/common';
import { HumanMessage, SystemMessage } from 'langchain/schema';

@Injectable()
export class AnswerService {
  constructor(private model: any) {}
  async get(question: string): Promise<string> {
    try {
      const systemContext = `Answer concisely and briefly basing on the following context:
      ###context
      You have a broad general knowledge
      Fact today is ${new Date().toISOString}
      ###rules
      If you do not know, just say I do not know
      `;
      const { content: answer } = await this.model.call([
        new SystemMessage(systemContext),
        new HumanMessage(question),
      ]);

      return answer;
    } catch (err) {
      throw new BadRequestException(err, 'The OpenAI API Error');
    }
  }
}
