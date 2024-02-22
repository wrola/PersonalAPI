import { Inject, Logger } from '@nestjs/common';
import {
  SKILLS_REPOSITORY,
  ISkillsRepository,
} from '../../infrastrucutre/skills.repository';
import { Skill } from '../skill.entity';
import {
  ACTIONS,
  IQdrantClient,
  QDRANT_CLIENT,
} from '../../../memory/infrastructure/qdrant.client';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class AddSkillCommand implements ICommand {
  constructor(
    public readonly name,
    public readonly description,
    public readonly webhook?,
    public readonly tags?,
    public readonly schema?,
    public readonly synced?,
  ) {}
}

@CommandHandler(AddSkillCommand)
export class AddSkillHandler implements ICommandHandler<AddSkillCommand, void> {
  constructor(
    @Inject(SKILLS_REPOSITORY) readonly skillRepository: ISkillsRepository,
    @Inject(QDRANT_CLIENT) readonly qdrantClient: IQdrantClient,
  ) {}
  async execute(command: AddSkillCommand): Promise<void> {
    const { name, description, synced = false } = command;
    const skill = Skill.create(
      name,
      description,
      command?.webhook,
      command?.tags,
      command?.schema,
    );
    await this.skillRepository.save(skill);

    if (!synced) {
      const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5 });
      const [embedding] = await embeddings.embedDocuments([
        skill.name + ': ' + skill.description,
      ]);
      const documentedMemory = new Document({
        pageContent: skill.name + ': ' + skill.description,
        metadata: {
          uuid: skill.id,
          name: skill.name,
          content: `${skill.name}: ${skill.description}`,
        },
      });
      try {
        await this.qdrantClient.upsert(ACTIONS, {
          wait: true,
          batch: {
            ids: [documentedMemory.metadata.uuid],
            payloads: [documentedMemory],
            vectors: [embedding],
          },
        });
        Logger.log('The skill added to qdrant', 'SKILLS');
      } catch (err) {
        Logger.error(err, 'SKILLS');
      }
    }
  }
}
