import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';
import { v4 } from 'uuid';

@Entity('skills')
export class Skill {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Index({ unique: true })
  @Column({ nullable: false })
  name: string;

  @Column()
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[] | null;

  @Column({ nullable: true })
  webhook: string | null;

  @Column({ type: 'jsonb', nullable: true })
  schema: SchemaSkill | null;

  @CreateDateColumn()
  createdAt: Date;

  static create(name, description, webhook?, tags?, schema?) {
    const skill = new Skill();
    skill.id = v4();
    skill.name = name;
    skill.description = description;

    if (webhook) skill.webhook = webhook;
    if (tags) skill.tags = tags;
    if (schema) skill.schema = schema;

    return skill;
  }
}

interface SchemaSkill {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}
