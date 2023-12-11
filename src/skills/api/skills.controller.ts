import { Body, Post, Res } from '@nestjs/common';
import { InputLearnDto } from './dto/input-learn.dto';
import { OutputLearnDto } from './dto/output-learn.dto';
import { Response } from 'express';

export class SkillsController {
  @Post('/learn')
  async learn(
    @Body() body: InputLearnDto,
    @Res() response: Response,
  ): Promise<Response<OutputLearnDto>> {
    await console.log(body);
    return response.json(new OutputLearnDto());
  }
}
