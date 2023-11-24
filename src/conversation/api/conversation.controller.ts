import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ConversationService } from '../Conversation.service';
import { InputConversationDto } from './dto/input-conversation.dto';
import { OutputConversationMessageDto } from '../../memory/api/dto/conversation-message-output.dto';

@Controller('/talk')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}
  @Post()
  async Conversation(
    @Body() body: InputConversationDto,
  ): Promise<OutputConversationMessageDto> {
    const { question } = body;

    Logger.log(`The question is: ${question}`);
    if (!question) throw new Error('Question not found');
    const intiContext = {};
    const result = await this.conversationService.call(question);
    Logger.log(`The Conversation is: ${result}`);
    return new OutputConversationMessageDto(result);
  }
}
