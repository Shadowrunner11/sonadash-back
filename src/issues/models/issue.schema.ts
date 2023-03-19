import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Type } from 'src/sonar-data-source/types';

export enum Severity {
  Blocker = 'BLOCKER',
  Critical = 'CRITICAL',
  Major = 'MAJOR',
  Minor = 'MINOR',
}

@ObjectType()
@Schema({ autoIndex: true, timestamps: true })
export class Issue {
  @Field()
  @Prop({ unique: true })
  sonarKey: string;

  @Field()
  @Prop()
  observation: Type;

  @Field()
  @Prop()
  severity: Severity;

  @Field()
  @Prop()
  language: string;

  @Field()
  @Prop()
  rule: string;

  @Field()
  @Prop()
  startLine: number;

  @Field({ nullable: true })
  @Prop()
  developerEmail?: string;

  @Field()
  @Prop({ index: 'asc' })
  issueCreatedAt: Date;

  @Field()
  @Prop()
  issueUpdatedAt?: Date;

  @Field({ nullable: true })
  @Prop()
  sonarHash?: string;

  @Field()
  @Prop()
  status?: string;

  @Field({ nullable: true })
  @Prop()
  scope?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  @Prop()
  tags?: string[];

  @Field({ nullable: true })
  @Prop()
  sonarRuleMessage?: string;

  @Field()
  @Prop()
  file: string;

  @Field()
  @Prop()
  project: string;
}

export type IssueDocument = HydratedDocument<Issue>;

export const IssueSchema = SchemaFactory.createForClass(Issue);

IssueSchema.index({ date: 'asc' });
