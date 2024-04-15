import { FindManyOptions } from 'typeorm';
import { Note } from '../core/note.entity';

export const NOTE_REPOSITORY = Symbol('NOTE_REPOSITORY');

export interface INoteRepository {
  save(note: Note): Promise<void>;
  find(findOptions: FindManyOptions<Note>);
}
