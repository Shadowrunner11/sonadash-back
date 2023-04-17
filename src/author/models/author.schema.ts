import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class Author {
  @Field()
  @Prop({ unique: true })
  email: string;

  @Prop()
  issues?: string[];

  @Field({ nullable: true })
  @Prop()
  firstname?: string;

  @Field({ nullable: true })
  @Prop()
  lastname?: string;

  @Field({ nullable: true })
  @Prop()
  squad?: string;

  @Field({ nullable: true })
  @Prop()
  tribe?: string;

  @Field({ nullable: true })
  @Prop()
  chapter?: string;

  @Field({ nullable: true })
  @Prop()
  provider?: string;

  @Field({ nullable: true })
  @Prop()
  role?: string;

  @Field({ nullable: true })
  @Prop()
  status?: string;
}

export type AuthorDocument = HydratedDocument<Author>;

export const AuthorSchema = SchemaFactory.createForClass(Author);
