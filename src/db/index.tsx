import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { dbSchema } from "./schema";
import FormSubmission from "./FormSubmission";

const adapter = new SQLiteAdapter({
  schema: dbSchema,
  dbName: "solyield",
  jsi: false,
  onSetUpError: (error) => {
    console.error("[WatermelonDB] Setup error:", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [FormSubmission],
});