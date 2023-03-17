import { IssueObservations, Severity } from './models/issue.schema';

export interface CreateIssuesDTO {
  sonarKey: string;
  observation: IssueObservations;
  severity: Severity;
  language: string;
  rule: string;
  startLine: number;
  developerEmail: string;
  date: Date;
  file: string;
}
