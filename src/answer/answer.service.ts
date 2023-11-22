import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { getJson } from 'serpapi';

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
      Answer in the language which question will be.
      Follow the format if it's propose
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
  async outsideCall(question: string): Promise<string> {
    const openAiResult = await this.get(question);
    const regex = /I do not know/;
    Logger.log(openAiResult);
    if (!regex.test(openAiResult)) {
      return openAiResult;
    }
    const { organic_results } = await getJson({
      engine: 'google',
      api_key: process.env.SERP_API_KEY,
      q: `${question}`,
    });
    Logger.log(organic_results[0].snippet);
    return openAiResult;
  }
}
