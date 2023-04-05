import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { HydratedDocument } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class DuplicationMetrics {
  @Prop()
  @Field()
  // duplicated_lines_density
  totalDensityPercent: number;

  @Prop()
  @Field()
  // duplicated_lines
  duplicatedLines: number;

  @Prop()
  @Field()
  // duplicated_blocks
  duplicatedBlocks: number;

  @Prop()
  @Field()
  // duplicated_files
  duplicatedFiles: number;
}

export type DuplicationDocument = HydratedDocument<DuplicationMetrics>;

export const DuplicationSchema =
  SchemaFactory.createForClass(DuplicationMetrics);
