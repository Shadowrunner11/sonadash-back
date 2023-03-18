import { Controller, Post } from '@nestjs/common';
import { AuthorMigrationService } from './author.migration.service';

@Controller('author')
export class AuthorController {
  constructor(private readonly migrationService: AuthorMigrationService) {}

  @Post('/migrate/all')
  migrateAllAuthors() {
    this.migrationService.migrateAllAuthor(10);
    return 'in process';
  }
}
