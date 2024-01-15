import { Body, Controller, Headers, Logger, Post, Res } from '@nestjs/common';
import { ConversationService } from '../conversation.service';
import { InputConversationDto } from './dto/input-conversation.dto';
import { v4 } from 'uuid';
import { OutputConversationDto } from './dto/output-conversation.dto';
import { Response } from 'express';
import { InputLearnDto } from '../../skills/api/dto/input-learn.dto';
import { OutputLearnDto } from '../../skills/api/dto/output-learn.dto';

@Controller()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}
  @Post('/talk')
  async conversation(
    @Body() body: InputConversationDto,
    @Res() response: Response,
    @Headers('x-conversation-id') conversationId?: string,
  ): Promise<Response<OutputConversationDto>> {
    const { question } = body;

    Logger.log(`The question is: ${question}`);

    if (!question) throw new Error('Question not found');

    const conversation = conversationId
      ? await this.conversationService.currentConversation(conversationId)
      : (conversationId = v4());

    Logger.log(`${conversation}`);

    const context = { conversationId };

    const { messages, schemas, defaultSchema } =
      this.conversationService.intentRecognition(question);

    const intent = (await this.conversationService.call(
      question,
      conversation,
      {
        ...context,
        messages,
        schemas,
        defaultSchema,
      },
    )) as {
      args: {
        type: number;
      };
    };

    const intentType = intent.args.type === 1 ? 'action' : 'query';

    Logger.log(`The intent is: ${intentType}`);

    if (intentType === 'action') {
      Logger.log(`The action result: ${intentType}`);
    }
    const result = await this.conversationService.call(
      question,
      conversation,
      context,
    );

    response.setHeader('x-conversation-id', conversationId);

    await this.conversationService.saveMessage(
      conversationId,
      question,
      result ?? 'No answer.',
    );
    Logger.log(`The answer is: ${result}`);

    return response.json(
      new OutputConversationDto(result as string, conversationId),
    );
  }

  @Post('/learn')
  async learn(
    @Body() body: InputLearnDto,
    @Res() response: Response,
  ): Promise<Response<OutputLearnDto>> {
    await console.log(body);
    return response.json(new OutputLearnDto());
  }
}
