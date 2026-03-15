import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { database } from "@/db";
import FormSubmission from "@/db/FormSubmission";

interface FormState {
  values: Record<string, string | string[]>;
  submitted: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: FormState = {
  values: {},
  submitted: false,
  saving: false,
  error: null,
};

// Thunk — writes to WatermelonDB, survives app restarts + offline
export const submitForm = createAsyncThunk(
  "form/submitForm",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { form: FormState };
    const v = state.form.values;

    try {
      await database.write(async () => {
        await database.get<FormSubmission>("form_submissions").create((record) => {
          record.invertedSerial = (v["f_inverter_serial"] as string) ?? "";
          record.generation     = (v["f_generation"] as string) ?? "";
          record.panelCondition = (v["f_panel_condition"] as string) ?? "";
          record.wiringCheck    = (v["f_wiring_check"] as string) ?? "";
          record.issuesJson     = JSON.stringify(v["f_issues"] ?? []);
          record.sitePhoto      = (v["f_site_photo"] as string) ?? "";
          record.docs           = (v["f_docs"] as string) ?? "";
          record.synced         = false; // will flip to true in challenge 2.2
        });
      });
    } catch (err) {
      return rejectWithValue("Failed to save form offline.");
    }
  }
);

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setFieldValue(
      state,
      action: PayloadAction<{ fieldId: string; value: string | string[] }>
    ) {
      state.values[action.payload.fieldId] = action.payload.value;
    },
    resetForm(state) {
      state.values = {};
      state.submitted = false;
      state.saving = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitForm.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(submitForm.fulfilled, (state) => {
        state.saving = false;
        state.submitted = true;
      })
      .addCase(submitForm.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFieldValue, resetForm } = formSlice.actions;
export default formSlice.reducer;