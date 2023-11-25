import { Body, Controller, Headers, Logger, Post } from '@nestjs/common';
import { ConversationService } from '../Conversation.service';
import { InputConversationDto } from './dto/input-conversation.dto';
import { v4 } from 'uuid';
import { OutputConversationDto } from './dto/output-conversation.dto';

@Controller('/talk')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}
  @Post()
  async conversation(
    @Body() body: InputConversationDto,
    @Headers('x-conversation-id') conversationId?: string,
  ): Promise<OutputConversationDto> {
    const { question } = body;

    Logger.log(`The question is: ${question}`);
    if (!question) throw new Error('Question not found');
    const conversation = conversationId
      ? await this.conversationService.currentConversation(conversationId)
      : v4();
    Logger.log(`${conversation}`);

    const result = await this.conversationService.call(question);
    Logger.log(`The Conversation is: ${result}`);
    return new OutputConversationDto(result, conversationId);
  }
}
