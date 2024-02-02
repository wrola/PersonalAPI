import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class MemoryInputDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  name: string;

  @IsArray()
  tags: Array<string>;
}
