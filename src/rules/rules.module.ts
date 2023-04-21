import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { SonarDataSourceModule } from 'src/sonar-data-source/sonar-data-source.module';

@Module({
  imports: [SupabaseModule, SonarDataSourceModule],
  providers: [RulesService],
  controllers: [RulesController],
})
export class RulesModule {}
