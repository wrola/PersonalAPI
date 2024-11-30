import { IsArray, IsObject, IsString } from 'class-validator';

export class NoteOutputDto {
  @IsString()
  title: string;

  @IsObject()
  content: Record<string, unknown>;

  @IsArray()
  tags: Array<string>;
}
