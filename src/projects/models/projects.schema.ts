import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export enum Qualifier {
  Fil = 'FIL',
  Trk = 'TRK',
  Uts = 'UTS',
}

export enum Visibility {
  visibility = 'PUBLIC',
}

@Schema({ timestamps: true })
export class Projects {
  @Prop()
  sonarKey: string;

  @Prop()
  name: string;

  @Prop()
  qualifier: Qualifier;

  @Prop()
  isFavorite?: boolean;

  @Prop()
  tags: [string?];

  @Prop()
  visibility: Visibility;

  @Prop()
  needIssueSync?: boolean;
}

export type ProjectsDocument = HydratedDocument<Projects>;

export const ProjectsSchema = SchemaFactory.createForClass(Projects);
