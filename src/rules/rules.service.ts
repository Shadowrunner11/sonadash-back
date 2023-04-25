import { Inject, Injectable, Logger } from '@nestjs/common';
import { keyBy, pick } from 'lodash';
import { SonarDataSourceService } from 'src/sonar-data-source/sonar-data-source.service';
import { MigrateData } from 'src/sonar-data-source/types';
import { SupabaseService } from 'src/supabase/supabase.service';
import {
  LanguageCreateDTO,
  QualityProfileCreateDTO,
  RulesCreateDTO,
  RulesStatusCreateDTO,
} from 'src/supabase/types';

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

    const { id } =
      (await this.supabaseService.getLanguageByName(language)) ?? {};

    if (!id) throw new Error('there is not language id');

    const rulesInSupaBase =
      (await this.supabaseService.getAllRulesByLanguageId(id)) ?? [];

    this.logger.log(`Rules in supabase ${rulesInSupaBase}`);

    const rulesByKey = keyBy(rulesInSupaBase, 'key');

    const rulesToCreate: RulesCreateDTO[] = rules
      .filter(({ key }) => !rulesByKey[key])
      .map((rawData) => {
        const result = pick(rawData, [
          'key',
          'name',
          'htmlDesc',
          'severity',
          'type',
        ]);
        return {
          ...result,
          lang_id: id,
        };
      });

    this.logger.log(`Rules to create ${rulesToCreate.length}`);

    return await this.supabaseService.createBulkByTable('rules', rulesToCreate);
  }

  //TODO: refactor to decoupled form language
  async migrateStatusByQualityProfile(
    qualityProfileKey: string,
    language: string,
  ) {
    const { id: language_id } =
      (await this.supabaseService.getLanguageByName(language)) ?? {};

    if (!language_id) throw new Error('Not found languge');

    const rulesFromSupaBase =
      await this.supabaseService.getAllRulesByLanguageId(language_id);

    const activeRules = await this.getRules({
      qprofile: qualityProfileKey,
      activation: 'yes',
    });

    const activeRulesByKey = keyBy(activeRules, 'key');

    const { id: qualityProfile_id } =
      (await this.supabaseService.getQualityProfileByKey(qualityProfileKey)) ??
      {};

    if (!qualityProfile_id) throw new Error("id doesn't exist");

    const parsedRulesStatus: RulesStatusCreateDTO[] =
      rulesFromSupaBase?.map(({ key, id }) => ({
        qualityProfile_id,
        rule_id: id,
        isActiveSonar: Boolean(activeRulesByKey[key]),
        isActive: Boolean(activeRulesByKey[key]),
        updated_at: new Date(),
      })) ?? [];

    return await this.supabaseService.createBulkByTable(
      'status',
      parsedRulesStatus,
    );
  }

  async bulkMigrateStatusByQProfile(data: MigrateData[], limit = 10) {
    while (data.length) {
      const slicedData = data.splice(0, limit);
      await Promise.all(
        slicedData.map(({ language, qualityProfileKey }) =>
          this.migrateStatusByQualityProfile(qualityProfileKey, language),
        ),
      );
    }
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

    const [{ lang }] = deactivatedRules;

    const rulesFromSupaBase =
      await this.supabaseService.getAllRulesByLanguageId(lang);

    const rulesFromSupaBaseBy = keyBy(rulesFromSupaBase, 'key');

    if (total > 500) throw new Error('Needs a batch process');

    const deactivatedRulesIds = deactivatedRules.map(
      ({ key }) => rulesFromSupaBaseBy[key].id,
    );

    const results = await Promise.all([
      this.supabaseService.updateRulesStatusesIsActiveSonar(
        qualityProfile,
        false,
        deactivatedRulesIds,
      ),
      this.supabaseService.updateRulesStatusesIsActiveSonarByExclusion(
        qualityProfile,
        true,
        deactivatedRulesIds,
      ),
    ]);

    return results;
  }

  async migrateLanguages() {
    const { languages } = await this.sonarDataService.getLanguages({});
    const parsedLanguage: LanguageCreateDTO[] = languages.map(
      ({ key, name }) => ({ alias: name, name: key }),
    );

    return await this.supabaseService.createBulkByTable(
      'languages',
      parsedLanguage,
    );
  }

  async migrateQualityProfiles() {
    const { profiles } = await this.sonarDataService.getQualityProfiles({});
    const language = await this.supabaseService.getAllLanguages();

    const languagesByName = keyBy(language, 'name');

    const parsedProfiles: QualityProfileCreateDTO[] = profiles.map(
      ({ key, name, language, isDefault }) => ({
        isDefault,
        key,
        name,
        updated_at: new Date(),
        language_id: languagesByName[language]?.id,
      }),
    );

    return await this.supabaseService.createBulkByTable(
      'qualityprofiles',
      parsedProfiles,
    );
  }
}
