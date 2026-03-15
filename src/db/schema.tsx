import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const dbSchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "form_submissions",
      columns: [
        { name: "f_inverter_serial", type: "string" },
        { name: "f_generation", type: "string" },
        { name: "f_panel_condition", type: "string" },
        { name: "f_wiring_check", type: "string" },
        { name: "f_issues", type: "string" },       // JSON.stringify(string[])
        { name: "f_site_photo", type: "string" },   // local URI
        { name: "f_docs", type: "string" },          // local URI
        { name: "synced", type: "boolean" },
        { name: "created_at", type: "number" },
      ],
    }),
  ],
});