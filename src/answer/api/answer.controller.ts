import { Body, Controller, Logger, Post } from '@nestjs/common';
import { InputAnswerDto } from './dto/input-answer.dto';
import { OutputAnswerDto } from './dto/output-answer.dto';
import { AnswerService } from '../answer.service';

@Controller('/answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}
  @Post()
  async answer(@Body() body: InputAnswerDto): Promise<OutputAnswerDto> {
    const { question } = body;

    Logger.log(`The question is: ${question}`);
    if (!question) throw new Error('Question not found');
    const result = await this.answerService.get(question);
    Logger.log(`The answer is: ${result}`);
    return new OutputAnswerDto(result);
  }
}
