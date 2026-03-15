import { database } from "@/db";
import FormSubmission from "@/db/FormSubmission";
import { Q } from "@nozbe/watermelondb";

// Mock API call — simulates pushing a record to a server
const mockApiPush = async (record: FormSubmission): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 95% success rate
      if (Math.random() > 0.05) {
        resolve();
      } else {
        reject(new Error("Mock server error"));
      }
    }, 800);
  });
};

// Mock file upload for site photo
const mockFileUpload = async (uri: string): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 500));
};

export type SyncResult = {
  synced: number;
  failed: number;
};

export const syncPendingForms = async (): Promise<SyncResult> => {
  const pendingRecords = await database
    .get<FormSubmission>("form_submissions")
    .query(Q.where("synced", false))
    .fetch();

  if (pendingRecords.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (const record of pendingRecords) {
    try {
      await mockApiPush(record);
      if (record.sitePhoto) {
        await mockFileUpload(record.sitePhoto);
      }
      await database.write(async () => {
        await record.update((r) => {
          r.synced = true;
        });
      });
      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed };
};