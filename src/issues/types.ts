import { Severity, Type } from 'src/sonar-data-source/types';

export interface CreateIssuesDTO {
  sonarKey: string;
  observation: Type;
  severity: Severity;
  language: string;
  rule: string;
  startLine: number;
  developerEmail?: string;
  issueCreatedAt: Date;
  issueUpdatedAt?: Date;
  sonarHash?: string;
  // TODO: use enums
  status?: string;
  // TODO: use enums
  scope?: string;
  tags?: string[];
  sonarRuleMessage?: string;
  file: string;
  project: string;
}
