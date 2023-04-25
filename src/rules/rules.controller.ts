import { Body, Controller, Post } from '@nestjs/common';
import { RulesService } from './rules.service';
import { ApiTags } from '@nestjs/swagger';
import { MigrateData } from 'src/sonar-data-source/types';

interface MigrateOptions {
  languages?: string;
  qprofile: string;
}

@Controller('rules')
@ApiTags('supabase')
export class RulesController {
  constructor(private rulesService: RulesService) {}

  @Post('/migrate/rules')
  migrateRules(@Body() { languages }: MigrateOptions) {
    if (!languages) throw new Error('Language is required');

    return this.rulesService.migrateRulesByLanguage(languages);
  }

  @Post('/migrate/status')
  migrateStatus(@Body() { qprofile, languages }: MigrateOptions) {
    if (!languages || !qprofile)
      throw new Error('Language and qprofile is required');

    return this.rulesService.migrateStatusByQualityProfile(qprofile, languages);
  }

  @Post('/migrate/data')
  migrateStatusByProfile(@Body() { data }: { data: MigrateData[] }) {
    if (
      !data?.every(
        ({ language, qualityProfileKey }) => language && qualityProfileKey,
      )
    )
      throw new Error('is required correct format');

    return this.rulesService.bulkMigrateStatusByQProfile(data);
  }

  @Post('/migrate/languages')
  migrateLanguages() {
    return this.rulesService.migrateLanguages();
  }

  @Post('/migrate/qualityprofiles')
  migrateQualityProfiles() {
    return this.rulesService.migrateQualityProfiles();
  }
}
