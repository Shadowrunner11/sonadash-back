import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { HydratedDocument } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class CoverageMetrics {
  @Prop()
  @Field()
  // coverage
  totalCoveragePercent: number;

  @Prop()
  @Field()
  // lines_to_cover
  linesToCover: number;

  @Prop()
  @Field()
  // uncovered_lines
  linesNoCoverage: number;

  @Prop()
  @Field()
  // line_coverage
  linesConveragePercent: number;

  @Prop()
  @Field()
  // conditions_to_cover
  qtyConditionsToCover: number;

  @Prop()
  @Field()
  // uncovered_conditions
  qtyConditionsWithoutCover: number;

  @Prop()
  @Field()
  // branch_coverage
  conditionsCoveragePercentage: number;
}

export type CoverageDocument = HydratedDocument<CoverageMetrics>;

export const CoverageSchema = SchemaFactory.createForClass(CoverageMetrics);
