import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

enum IssueObservations {
  Bug = 'BUG',
  CodeSmell = 'CODE_SMELL',
}

export enum Severity {
  Blocker = 'BLOCKER',
  Critical = 'CRITICAL',
  Major = 'MAJOR',
  Minor = 'MINOR',
}

@Schema()
export class Issue {
  @Prop()
  observation: IssueObservations;

  @Prop()
  severity: Severity;

  @Prop()
  language: string;
}

export type IssueDocument = HydratedDocument<Issue>;

export const IssueSchema = SchemaFactory.createForClass(Issue);
