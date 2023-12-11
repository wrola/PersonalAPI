import { Inject } from '@nestjs/common';
import { SkillHandler } from './skill.handler';
import {
  SKILLS_REPOSITORY,
  ISkillsRepository,
} from '../../infrastrucutre/skills.repository';
import { Skill } from '../skill.entity';

export class AddSkillHandler implements SkillHandler {
  constructor(
    readonly payload: Record<string, unknown>, // TODO ADD INPUT DTO
    @Inject(SKILLS_REPOSITORY) readonly skillRepository: ISkillsRepository,
  ) {}
  async execute(): Promise<void> {
    const { name, description } = this.payload;
    const skill = Skill.create(
      name,
      description,
      this.payload?.webhook,
      this.payload?.tags,
      this.payload?.schema,
    );
    this.skillRepository.save(skill);
  }
}
