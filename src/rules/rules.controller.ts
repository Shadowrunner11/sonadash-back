import { Body, Controller, Post } from '@nestjs/common';
import { RulesService } from './rules.service';

interface MigrateOptions {
  languages: string;
  qprofile: string;
}

@Controller('rules')
export class RulesController {
  constructor(private rulesService: RulesService) {}

  @Post('/migrate/rules')
  migrateRules(@Body() { languages }: MigrateOptions) {
    return this.rulesService.migrateRulesByLanguage(languages);
  }

  @Post('/migrate/status')
  migrateStatus(@Body() { qprofile, languages }: MigrateOptions) {
    return this.rulesService.migrateStatusByQualityProfile(qprofile, languages);
  }
}
