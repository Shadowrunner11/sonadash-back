import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema()
export class Languages {
  @Prop()
  val: string;

  @Prop()
  name: string;
}

export type LanguagesDocument = HydratedDocument<Languages>;

export const LanguagesSchema = SchemaFactory.createForClass(Languages);
