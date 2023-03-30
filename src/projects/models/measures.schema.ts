import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { HydratedDocument } from 'mongoose';
import { MeasuresMetrics } from './measuresMetrics.schema';

export enum Qualifier {
  Fil = 'FIL',
  Trk = 'TRK',
  Uts = 'UTS',
}

@ObjectType()
@Schema({ timestamps: true })
export class Measures {
  @Prop()
  @Field()
  key: string;

  @Prop()
  @Field()
  name: string;

  @Prop()
  @Field()
  description: string;

  @Prop()
  @Field()
  qualifier: Qualifier;

  @Prop()
  @Field()
  measuresMetrics: MeasuresMetrics;
}

export type MeasuresDocument = HydratedDocument<Measures>;

export const MeasuresSchema = SchemaFactory.createForClass(Measures);
