export interface RulesCreateDTO {
  key: string;
  lang: string;
  name: string;
  htmlDesc?: string;
  severity?: string;
  type?: string;
}

export interface RuleDTO extends RulesCreateDTO {
  id: string;
  created_at: Date;
}

export interface RulesStatusCreateDTO {
  isActivate: boolean;
  isActiveSonar: boolean;
  qualityProfileKey: string;
  qualityProfileName?: string;
  rule_id: string;
  lastActualization?: Date;
}

export interface RulesStatus extends RulesCreateDTO {
  id: string;
  createdAt: Date;
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
    };
  };
}
