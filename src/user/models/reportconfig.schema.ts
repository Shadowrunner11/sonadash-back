import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true, _id: false })
export class ReportConfig {
  @Prop()
  projects: [{ label: string; source: string }];

  @Prop()
  authors: [{ label: string; source: string }];

  @Prop()
  issues: [{ label: string; source: string }];
}
