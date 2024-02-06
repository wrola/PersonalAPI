import { Body, Controller, Inject, Post } from '@nestjs/common';
import { IMemoryService, MEMORY_SERVICE } from '../memory.service';
import { MemoryOutputDto } from './dto/memory-output.dto';
import { MemoryInputDto } from './dto/memory-input.dto';

@Controller()
export class MemoryController {
  constructor(@Inject(MEMORY_SERVICE) private memoryService: IMemoryService) {}

  @Post('/memory')
  async learn(@Body() body: MemoryInputDto): Promise<MemoryOutputDto> {
    // TODO create tags and name if there not present
    return await this.memoryService.add(body);
  }
}
