import {
  Body,
  Controller,
  Headers,
  Inject,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { ConversationService } from '../conversation.service';
import { InputConversationDto } from './dto/input-conversation.dto';
import { v4 } from 'uuid';
import { OutputConversationDto } from './dto/output-conversation.dto';
import { Response } from 'express';
import { InputLearnDto } from '../../skills/api/dto/input-learn.dto';
import { OutputLearnDto } from '../../skills/api/dto/output-learn.dto';
import {
  PERFORM_ACTION,
  PerformAction,
} from '../../skills/core/handlers/perfom-action.handler';

@Controller()
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    @Inject(PERFORM_ACTION) private readonly performAction: PerformAction,
  ) {}
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
    response.setHeader('x-conversation-id', conversationId);
    const { messages, schemas, defaultSchema } =
      this.conversationService.intentRecognition(question);

    const { content, memories } = (await this.conversationService.call(
      question,
      conversation,
      {
        conversationId,
        messages,
        schemas,
        defaultSchema,
      },
    )) as any;

    const intentType = content.args.type === 1 ? 'action' : 'query';

    Logger.log(`The intent is: ${intentType}`);

    if (intentType === 'action') {
      Logger.log(`The action result: ${intentType}`);
      this.performAction.setPayload({ query: question, memories });
      await this.performAction.execute();

      return response.json(
        new OutputConversationDto('The action has taken place', conversationId),
      );
    }
    const result = await this.conversationService.call(question, conversation, {
      messages,
    });

    await this.conversationService.saveMessage(
      conversationId,
      question,
      result ?? 'No answer.',
    );

    Logger.log(`Is there a answer? ${result ? 'Yes' : 'No answer.'}`);

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
