import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema()
export class Author {
  @Prop()
  email: string;

  @Prop()
  issues?: string[];
}

export type AuthorDocument = HydratedDocument<Author>;

export const AuthorSchema = SchemaFactory.createForClass(Author);
