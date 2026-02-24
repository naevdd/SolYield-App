import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CheckInStatus } from "@/types";

interface CheckInState {
  status: CheckInStatus;
  activeSiteId: string | null;
  lastCheckedIn: string | null; // ISO timestamp
}

const initialState: CheckInState = {
  status: "idle",
  activeSiteId: null,
  lastCheckedIn: null,
};

const checkInSlice = createSlice({
  name: "checkIn",
  initialState,
  reducers: {
    setCheckInStatus(state, action: PayloadAction<CheckInStatus>) {
      state.status = action.payload;
    },
    setActiveSite(state, action: PayloadAction<string>) {
      state.activeSiteId = action.payload;
    },
    checkInSuccess(state) {
      state.status = "success";
      state.lastCheckedIn = new Date().toISOString();
    },
    resetCheckIn(state) {
      state.status = "idle";
      state.activeSiteId = null;
    },
  },
});

export const { setCheckInStatus, setActiveSite, checkInSuccess, resetCheckIn } =
  checkInSlice.actions;
export default checkInSlice.reducer;
