import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema()
export class Rules {
  @Prop()
  rules: string;
}

export type RulesDocument = HydratedDocument<Rules>;

export const RulesSchema = SchemaFactory.createForClass(Rules);
