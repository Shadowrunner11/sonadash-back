import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Author {
  @Prop({ unique: true })
  email: string;

  @Prop()
  issues?: string[];
}

export type AuthorDocument = HydratedDocument<Author>;

export const AuthorSchema = SchemaFactory.createForClass(Author);
