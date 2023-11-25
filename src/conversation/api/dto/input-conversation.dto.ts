import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InputConversationDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}
