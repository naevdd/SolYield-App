import { configureStore } from "@reduxjs/toolkit";
import visitsReducer from "./visitsSlice";
import checkInReducer from "./checkInSlice";
import formReducer from "./formSlice";

export const store = configureStore({
  reducer: {
    visits: visitsReducer,
    checkIn: checkInReducer,
    form: formReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
