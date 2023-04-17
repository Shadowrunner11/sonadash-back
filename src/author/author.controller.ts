import { Body, Controller, Post } from '@nestjs/common';
import { AuthorMigrationService } from './author.migration.service';
import { AuthorService } from './author.service';
import { CreateAuthorsDTO } from './types';

interface ManyAuthorsDTO {
  data: CreateAuthorsDTO[];
}

@Controller('author')
export class AuthorController {
  constructor(
    private readonly migrationService: AuthorMigrationService,
    private readonly authorService: AuthorService,
  ) {}

  @Post('/migrate/all')
  migrateAllAuthors() {
    this.migrationService.migrateAllAuthor(10);
    return 'in process';
  }

  @Post('/upsert')
  upsertAuthors(@Body() authorsDTO: ManyAuthorsDTO) {
    return this.authorService.bulkUpsertAuthors(authorsDTO.data);
  }
}
