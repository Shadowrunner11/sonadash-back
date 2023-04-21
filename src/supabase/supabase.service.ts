import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import type { Database, RulesCreateDTO, RulesStatusCreateDTO } from './types';

@Injectable()
export class SupabaseService {
  private logger = new Logger(SupabaseService.name);
  private client;

  constructor(private configService: ConfigService) {
    const supaBaseURI = this.configService.get<string>(
      'SUPBA_BASE_CLIENT',
      'https://xyzcompany.supabase.co',
    );

    const supaBaseToken =
      this.configService.getOrThrow<string>('SUPA_BASE_TOKEN');

    this.client = createClient<Database>(supaBaseURI, supaBaseToken);
  }

  async createDataByTable(
    table: 'rules' | 'status',
    dataDTOs: (RulesCreateDTO | RulesStatusCreateDTO)[],
  ) {
    const { status, error } = await this.client.from(table).insert(dataDTOs);

    if (error) throw error;

    return status;
  }

  async getAllRulesByLanguage(language: string) {
    const { data } = await this.client
      .from('rules')
      .select('id, key')
      .eq('lang', language)
      .throwOnError();

    return data;
  }

  async createBulkByTable(
    tableName: 'rules' | 'status',
    data: (RulesCreateDTO | RulesStatusCreateDTO)[],
    limitSize = 100,
  ) {
    const dataCopy = [...data];

    this.logger.log(`data copy ${dataCopy.length}`);

    const results = [];

    while (dataCopy.length) {
      this.logger.log('Migrating... ');
      const batchData = dataCopy.splice(0, limitSize);
      const result = await this.createDataByTable(tableName, batchData);

      results.push(result);

      this.logger.log('Finish Migrating...');
    }

    return results;
  }

  async getRulesStatusesByQualityProfile(qualityProfileKey: string) {
    const { data } = await this.client
      .from('status')
      // eslint-disable-next-line prettier/prettier
      .select(`
        id,
        rule_id(
          key
        )
      `,
      )
      .eq('qualityProfileKey', qualityProfileKey)
      .throwOnError();

    return data;
  }

  async updateRulesStatusesIsActiveSonar(
    qualityProfileKey: string,
    isActiveSonarNewValue: boolean,
    ruleIds: string[],
  ) {
    const { data } = await this.client
      .from('status')
      .update({ isActiveSonar: isActiveSonarNewValue })
      .in('rule_id', ruleIds)
      .eq('qualityProfileKey', qualityProfileKey)
      .eq('isActiveSonar', !isActiveSonarNewValue)
      .select()
      .throwOnError();

    return data;
  }

  async updateRulesStatusesIsActiveSonarByExclusion(
    qualityProfileKey: string,
    isActiveSonarNewValue: boolean,
    ruleIds: string[],
  ) {
    const { data } = await this.client
      .from('status')
      .update({ isActiveSonar: isActiveSonarNewValue })
      .not('rule_id', 'in', ruleIds)
      .eq('qualityProfileKey', qualityProfileKey)
      .eq('isActiveSonar', !isActiveSonarNewValue)
      .select()
      .throwOnError();

    return data;
  }
}
