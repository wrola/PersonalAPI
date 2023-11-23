import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { getJson } from 'serpapi';

@Injectable()
export class AnswerService {
  constructor(private model: any) {}
  async get(question: string, context?: string): Promise<string> {
    try {
      const systemContext = `Answer concisely and briefly basing on the following context:
      Odpowiadaj konrektnie i zwieźle
      ###context
      Masz ogólna wiedze i wiadomości z tego kontekstu ${JSON.stringify(
        context,
      )}
      Dzis jest ${new Date().toISOString}
      ###zasady
      Jeśli nie wiesz, pisz "Nie wiem"
      `;
      Logger.log(systemContext);
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
    const regex = /(Przepraszam|Nie znam|Nie wiem)/;
    Logger.log(openAiResult);
    if (!regex.test(openAiResult)) {
      return openAiResult;
    }
    const { organic_results } = await getJson({
      engine: 'google',
      api_key: process.env.SERP_API_KEY,
      q: `${question}`,
    });
    Logger.log(`Answer from SERP ${JSON.stringify(organic_results[0])}`);

    const openAIWithGoogleContext = await this.get(
      question,
      organic_results[0],
    );
    return openAIWithGoogleContext;
  }
}
