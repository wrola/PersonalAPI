import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Skills } from '../../core/skills';

export class InputLearnDto {
  @IsString()
  @IsNotEmpty()
  type: Skills;

  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsOptional()
  tags: Array<string>;

  @IsString()
  source: string;
}
