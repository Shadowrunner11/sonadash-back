import { Inject, Injectable, Logger } from '@nestjs/common';
import { keyBy, pick } from 'lodash';
import { SonarDataSourceService } from 'src/sonar-data-source/sonar-data-source.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { RulesCreateDTO, RulesStatusCreateDTO } from 'src/supabase/types';

@Injectable()
export class RulesService {
  private logger = new Logger(RulesService.name);

  constructor(
    @Inject(SonarDataSourceService)
    private sonarDataService: SonarDataSourceService,
    @Inject(SupabaseService) private supabaseService: SupabaseService,
  ) {}

  async getActivated(qualityProfileKey: string) {
    return await this.sonarDataService.getRules({
      paginationParams: {
        p: 1,
        qprofile: qualityProfileKey,
        activation: 'yes',
      },
    });
  }

  async getDeactivated(qualityProfileKey: string) {
    return await this.sonarDataService.getRules({
      paginationParams: {
        qprofile: qualityProfileKey,
        activation: 'no',
      },
    });
  }

  async getRules(
    params: { languages?: string; qprofile?: string; activation?: string },
    concurrentChunkSize = 10,
  ) {
    const { rules: firstRulesResponse, total } =
      await this.sonarDataService.getRules({
        paginationParams: {
          ...params,
          p: 1,
          ps: 500,
        },
      });

    this.logger.log(
      `Total data ${total} and firstresponse ${firstRulesResponse.length}`,
    );

    const toProccessTotal = Math.round((total / 500 - 1) / concurrentChunkSize);

    let chunkCount = 0;

    this.logger.log(`Total chunks to procces is ${toProccessTotal}`);

    const emptyArray = Array.from(Array(concurrentChunkSize));

    while (chunkCount <= toProccessTotal) {
      this.logger.log(`Count ${chunkCount} / ${chunkCount}`);

      const results = await Promise.all(
        emptyArray.map((_, index) =>
          this.sonarDataService.getRules({
            paginationParams: {
              ...params,
              p:
                (!chunkCount ? 2 : 0) +
                index +
                chunkCount * concurrentChunkSize,
              ps: 500,
            },
          }),
        ),
      );

      firstRulesResponse.push(...results.flatMap(({ rules }) => rules));
      chunkCount++;
    }

    this.logger.log(`Finishing getting ${firstRulesResponse.length} data`);

    return firstRulesResponse;
  }

  async getRulesByLanguage(language: string) {
    return await this.getRules({
      languages: language,
    });
  }

  async migrateRulesByLanguage(language: string) {
    const rules = await this.getRulesByLanguage(language);

    this.logger.log(`Rules ${rules.length}`);

    const rulesInSupaBase = await this.supabaseService.getAllRulesByLanguage(
      language,
    );

    this.logger.log(`Rules in supabase ${rulesInSupaBase}`);

    const rulesByKey = keyBy(rulesInSupaBase, 'key');

    const rulesToCreate: RulesCreateDTO[] = rules
      .filter(({ key }) => !rulesByKey[key])
      .map((rawData) =>
        pick(rawData, ['key', 'lang', 'name', 'htmlDesc', 'severity', 'type']),
      );

    this.logger.log(`Rules to create ${rulesToCreate.length}`);

    return await this.supabaseService.createBulkByTable('rules', rulesToCreate);
  }

  async migrateStatusByQualityProfile(
    qualityProfileKey: string,
    language: string,
  ) {
    const rulesFromSupaBase = await this.supabaseService.getAllRulesByLanguage(
      language,
    );
    const activeRules = await this.getRules({
      qprofile: qualityProfileKey,
      activation: 'yes',
    });

    const activeRulesByKey = keyBy(activeRules, 'key');

    const parsedRulesStatus: RulesStatusCreateDTO[] =
      rulesFromSupaBase?.map(({ key }) => ({
        qualityProfileKey,
        ruleKey: key,
        isActiveSonar: Boolean(activeRulesByKey[key]),
        isActivate: Boolean(activeRulesByKey[key]),
      })) ?? [];

    return await this.supabaseService.createBulkByTable(
      'status',
      parsedRulesStatus,
    );
  }

  async updateDeactivatedRules(qualityProfile: string) {
    const { rules: deactivatedRules, total } =
      await this.sonarDataService.getRules({
        paginationParams: {
          activation: 'no',
          qprofile: qualityProfile,
          p: 1,
          ps: 500,
        },
      });

    if (total > 500) throw new Error('Needs a batch process');

    const results = await Promise.all([
      this.supabaseService.updateRulesStatusesIsActiveSonar(
        qualityProfile,
        false,
        deactivatedRules.map(({ key }) => key),
      ),
      this.supabaseService.updateRulesStatusesIsActiveSonarByExclusion(
        qualityProfile,
        true,
        deactivatedRules.map(({ key }) => key),
      ),
    ]);

    return results;
  }
}