import { Body, Controller, Post } from '@nestjs/common';
import { CatsService, CreateCatDTO } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  create(@Body() createCatDTO: CreateCatDTO) {
    return this.catsService.create(createCatDTO);
  }
}
