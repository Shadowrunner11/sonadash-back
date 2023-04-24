import { Severity, Type } from 'src/sonar-data-source/types';

export interface RulesCreateDTO {
  key: string;
  lang_id: string;
  name: string;
  htmlDesc?: string;
  severity?: Severity;
  type?: Type;
}

export interface RuleDTO extends RulesCreateDTO {
  id: string;
}

export interface RulesStatusCreateDTO {
  isActive: boolean;
  isActiveSonar: boolean;
  qualityProfile_id: string;
  rule_id: string;
  lastActualizationSonar?: Date;
  updated_at: Date;
}

export interface QualityProfileCreateDTO {
  key: string;
  name: string;
  language_id: string;
  updated_at: Date;
  isDefault: boolean;
}

export interface QualityProfileDTO extends QualityProfileCreateDTO {
  id: string;
  created_at: Date;
}

export interface LanguageCreateDTO {
  name: string;
  alias: string;
}

export interface LanguageDTO extends LanguageCreateDTO {
  id: string;
}

export interface BasicRuleInfo {
  name: string;
}

export interface RulesStatus extends RulesStatusCreateDTO {
  id: string;
  created_at: Date;
}

export interface Database {
  public: {
    Tables: {
      rules: {
        Row: RuleDTO;
        Insert: RulesCreateDTO;
        Update: RulesCreateDTO;
      };
      status: {
        Row: RulesStatus;
        Insert: RulesStatusCreateDTO;
        Update: RulesStatusCreateDTO;
      };
      languages: {
        Row: LanguageDTO;
        Insert: LanguageCreateDTO;
        Update: LanguageCreateDTO;
      };
      qualityprofiles: {
        Row: QualityProfileDTO;
        Insert: QualityProfileCreateDTO;
        Update: QualityProfileCreateDTO;
      };
    };
  };
}
