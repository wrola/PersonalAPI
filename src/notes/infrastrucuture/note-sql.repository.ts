import { FindManyOptions, Repository } from 'typeorm';
import { INoteRepository } from './note.repository';
import { Note } from '../core/note.entity';

export class SqlNoteRepository implements INoteRepository {
  constructor(private readonly repository: Repository<Note>) {}
  async save(note: Note): Promise<void> {
    await this.repository.save(note);
  }
  async find(findOptions: FindManyOptions<Note>): Promise<Array<Note>> {
    return this.repository.find(findOptions);
  }
}
