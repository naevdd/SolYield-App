import { useEffect, useRef, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { syncPendingForms, SyncResult } from "@/services/syncService";

export type SyncStatus =
  | { state: "idle" }
  | { state: "syncing" }
  | { state: "success"; result: SyncResult }
  | { state: "error"; message: string };

export function useNetworkSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: "idle" });
  const wasConnected = useRef<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;

      // Only trigger sync when transitioning from offline → online
      if (wasConnected.current === false && isConnected) {
        setSyncStatus({ state: "syncing" });
        try {
          const result = await syncPendingForms();
          setSyncStatus({ state: "success", result });
          // Auto-clear after 4 seconds
          setTimeout(() => setSyncStatus({ state: "idle" }), 4000);
        } catch (err) {
          setSyncStatus({ state: "error", message: "Sync failed. Will retry on next connection." });
          setTimeout(() => setSyncStatus({ state: "idle" }), 4000);
        }
      }

      wasConnected.current = isConnected;
    });

    return () => unsubscribe();
  }, []);

  return syncStatus;
}