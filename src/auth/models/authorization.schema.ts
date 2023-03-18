import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema()
export class Authorization {
  @Prop()
  username: string;

  @Prop()
  password: string;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  tokensonar: string;

  @Prop()
  token: string;
}

export type AuthorizationDocument = HydratedDocument<Authorization>;

export const AuthorizationSchema = SchemaFactory.createForClass(Authorization);
