import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from '../core/skill.entity';
import { Repository } from 'typeorm';

export const SKILLS_REPOSITORY = Symbol('SKILLS_REPOSITORY');

export interface ISkillsRepository {
  findOne(id: string): Promise<Skill>;
  save(skill: Skill): Promise<void>;
}

export class SkillsRepository implements ISkillsRepository {
  constructor(
    @InjectRepository(Skill) private readonly repository: Repository<Skill>,
  ) {}
  async findOne(id: string): Promise<Skill> {
    return this.repository.findOne({ where: { id } });
  }
  async save(skill: Skill): Promise<void> {
    await this.repository.save(skill);
  }
}
