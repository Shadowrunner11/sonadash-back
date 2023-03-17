import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema()
export class Files {
  @Prop()
  files: string;
}

export type FilesDocument = HydratedDocument<Files>;

export const FilesSchema = SchemaFactory.createForClass(Files);
