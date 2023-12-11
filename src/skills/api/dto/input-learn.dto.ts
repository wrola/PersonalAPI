import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InputLearnDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}
