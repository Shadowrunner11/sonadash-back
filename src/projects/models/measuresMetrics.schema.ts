import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class MeasuresMetrics {
  @Prop()
  @Field()
  metricKeys: string;

  @Prop()
  @Field()
  value: number;
}

export const MeasuresMetricsSchema =
  SchemaFactory.createForClass(MeasuresMetrics);
