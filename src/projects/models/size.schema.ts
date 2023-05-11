import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class SizeMetrics {
  @Prop()
  //ncloc
  linesOfCode: number;

  @Prop()
  //lines
  totalLines: number;
}

export type SizeMetricsDocument = HydratedDocument<SizeMetrics>;

export const SizeMetricSchema = SchemaFactory.createForClass(SizeMetrics);
