import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { CoverageMetrics } from './measures.schema';
import { DuplicationMetrics } from './duplications.schema';

export enum Qualifier {
  Fil = 'FIL',
  Trk = 'TRK',
  Uts = 'UTS',
}

export enum Visibility {
  visibility = 'PUBLIC',
}

@ObjectType()
@Schema({ timestamps: true })
export class Projects {
  @Prop()
  @Field()
  sonarKey: string;

  @Prop()
  @Field()
  name: string;

  @Prop()
  @Field()
  qualifier: Qualifier;

  @Prop()
  @Field({ nullable: true })
  isFavorite?: boolean;

  @Prop()
  @Field(() => [String], { nullable: 'items' })
  tags: string[];

  @Prop()
  @Field()
  visibility: Visibility;

  @Prop()
  @Field({ nullable: true })
  needIssueSync?: boolean;

  @Prop()
  coverageMetrics: CoverageMetrics;

  @Prop()
  duplicationMetrics: DuplicationMetrics;
}

export type ProjectsDocument = HydratedDocument<Projects>;

export const ProjectsSchema = SchemaFactory.createForClass(Projects);
