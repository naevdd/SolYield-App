import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { EnrichedVisit } from "@/types";
import { schedule } from "@/data/schedule";
import { sites } from "@/data/sites";

// Enrich schedule entries with site info
const enrichedVisits: EnrichedVisit[] = schedule.map((visit) => {
  const site = sites.find((s) => s.id === visit.siteId);
  return {
    ...visit,
    siteName: site?.name ?? "Unknown Site",
    capacity: site?.capacity ?? "",
    location: site?.location ?? { lat: 0, lng: 0 },
  };
});

interface VisitsState {
  list: EnrichedVisit[];
  synced: boolean;
}

const initialState: VisitsState = {
  list: enrichedVisits,
  synced: false,
};

const visitsSlice = createSlice({
  name: "visits",
  initialState,
  reducers: {
    setSynced(state, action: PayloadAction<boolean>) {
      state.synced = action.payload;
    },
    setVisits(state, action: PayloadAction<EnrichedVisit[]>) {
      state.list = action.payload;
    },
  },
});

export const { setSynced, setVisits } = visitsSlice.actions;
export default visitsSlice.reducer;
