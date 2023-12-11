import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { v4 } from 'uuid';

@Entity('skills')
export class Skill {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column()
  description: string;

  @Column({ type: 'jsonb' })
  tags: string[];

  @Column({ nullable: true })
  webhook: string;

  @Column({ type: 'jsonb', nullable: true })
  schema: object;

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
