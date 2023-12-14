import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { InputLearnDto } from './dto/input-learn.dto';
import { OutputLearnDto } from './dto/output-learn.dto';
import { Response } from 'express';
import {
  ISkillHandlerFactory,
  SKILL_HANDLER_FACTORY,
} from '../core/skill.factory';

@Controller()
export class SkillsController {
  constructor(
    @Inject(SKILL_HANDLER_FACTORY)
    private skillsFactoryHandler: ISkillHandlerFactory,
  ) {}

  @Post('/learn')
  async learn(
    @Body() body: InputLearnDto,
    @Res() response: Response,
  ): Promise<Response<OutputLearnDto>> {
    const skillHandler = this.skillsFactoryHandler.create(body);
    await skillHandler.execute();
    return response.json(new OutputLearnDto());
  }
}
