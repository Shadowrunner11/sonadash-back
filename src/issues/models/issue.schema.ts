import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export enum IssueObservations {
  Bug = 'BUG',
  CodeSmell = 'CODE_SMELL',
  DuplicatedCode = 'CODIGO_DUPLICADO',
  Cobertura = 'COBERTURA',
}

export enum Severity {
  Blocker = 'BLOCKER',
  Critical = 'CRITICAL',
  Major = 'MAJOR',
  Minor = 'MINOR',
}

@Schema({ autoIndex: true, timestamps: true })
export class Issue {
  @Prop()
  sonarKey: string;

  @Prop()
  observation: IssueObservations;

  @Prop()
  severity: Severity;

  @Prop()
  language: string;

  @Prop()
  rule: string;

  @Prop()
  startLine: number;

  @Prop()
  developerEmail: string;

  @Prop({ index: 'asc' })
  date: Date;

  @Prop()
  file: string;
}

export type IssueDocument = HydratedDocument<Issue>;

export const IssueSchema = SchemaFactory.createForClass(Issue);

IssueSchema.index({ date: 'asc' });
