import { Model } from "@nozbe/watermelondb";
import { field, readonly, date } from "@nozbe/watermelondb/decorators";

export default class FormSubmission extends Model {
  static table = "form_submissions";

  @field("f_inverter_serial") invertedSerial!: string;
  @field("f_generation") generation!: string;
  @field("f_panel_condition") panelCondition!: string;
  @field("f_wiring_check") wiringCheck!: string;
  @field("f_issues") issuesJson!: string;       // stored as JSON string
  @field("f_site_photo") sitePhoto!: string;
  @field("f_docs") docs!: string;
  @field("synced") synced!: boolean;
  @readonly @date("created_at") createdAt!: Date;

  // Convenience getter — deserializes the JSON array
  get issues(): string[] {
    try {
      return JSON.parse(this.issuesJson || "[]");
    } catch {
      return [];
    }
  }
}