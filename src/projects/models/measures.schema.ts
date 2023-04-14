import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { HydratedDocument } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class CoverageMetrics {
  @Prop()
  @Field({ nullable: true })
  // coverage
  totalCoveragePercent?: number;

  @Prop()
  @Field({ nullable: true })
  // lines_to_cover
  linesToCover?: number;

  @Prop()
  @Field({ nullable: true })
  // uncovered_lines
  linesNoCoverage?: number;

  @Prop()
  @Field({ nullable: true })
  // line_coverage
  linesCoveragePercent?: number;

  @Prop()
  @Field({ nullable: true })
  // conditions_to_cover
  qtyConditionsToCover?: number;

  @Prop()
  @Field({ nullable: true })
  // uncovered_conditions
  qtyConditionsWithoutCover?: number;

  @Prop()
  @Field({ nullable: true })
  // branch_coverage
  conditionsCoveragePercentage?: number;
}

export type CoverageDocument = HydratedDocument<CoverageMetrics>;

export const CoverageSchema = SchemaFactory.createForClass(CoverageMetrics);
