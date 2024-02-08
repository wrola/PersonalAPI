import { Body, Controller, Inject, Post } from '@nestjs/common';
import { IMemoryService, MEMORY_SERVICE } from '../memory.service';
import { MemoryOutputDto } from './dto/memory-output.dto';
import { MemoryInputDto } from './dto/memory-input.dto';

@Controller()
export class MemoryController {
  constructor(@Inject(MEMORY_SERVICE) private memoryService: IMemoryService) {}

  @Post('/memories')
  async learn(@Body() body: MemoryInputDto): Promise<MemoryOutputDto> {
    return await this.memoryService.add(body);
  }
}
