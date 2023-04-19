import { Prop, Schema } from '@nestjs/mongoose';
import { ReportConfig } from './reportconfig.schema';

@Schema({ timestamps: true })
export class UserConfig {
  @Prop()
  username: string;

  @Prop()
  reportConfig: ReportConfig;
}
