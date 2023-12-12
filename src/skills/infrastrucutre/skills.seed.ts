import { InjectRepository } from '@nestjs/typeorm';
import { ISkillsRepository } from './skills.repository';
import { Skill } from '../core/skill.entity';
import { Skills } from '../core/skills';
import { AddSkillHandler } from '../core/handlers/add-skill.handler';
import { Injectable, Logger } from '@nestjs/common';

export const SKILLS_SEED_SERVICE = Symbol('SKILLS_SEED_SERVICE');

@Injectable()
export class SkillSeedService {
  constructor(@InjectRepository(Skill) private repository: ISkillsRepository) {}

  async initializeSkills() {
    const existingSkills = await this.repository.find({});

    if (this.areAllInitialSkillsAvailable(existingSkills)) {
      return;
    }

    await this.addInitialSkills();
    Logger.log('Added Initial Skillset');
  }

  areAllInitialSkillsAvailable(skills: Array<Skill>) {
    return (
      skills.length > 0 &&
      skills.every((skill) =>
        Object.values(Skills).includes(skill.name as Skills),
      )
    );
  }

  async addInitialSkills() {
    const mappedSkills = Object.values(Skills).map((skill) => ({
      name: skill,
      description: skill,
    }));

    return Promise.all(
      mappedSkills.map(async (skillProps) => {
        const addSkill = new AddSkillHandler(skillProps, this.repository);
        await addSkill.execute();
      }),
    );
  }
}
