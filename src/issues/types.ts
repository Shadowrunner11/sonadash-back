import { Severity, Type } from 'src/sonar-data-source/types';

export interface CreateIssuesDTO {
  sonarKey: string;
  observation: Type;
  severity: Severity;
  language: string;
  rule: string;
  startLine: number;
  developerEmail: string;
  date: Date;
  file: string;
}
