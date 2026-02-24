import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FormState {
  values: Record<string, string | string[]>;
  submitted: boolean;
}

const initialState: FormState = {
  values: {},
  submitted: false,
};

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
    },
    submitForm(state) {
      state.submitted = true;
    },
  },
});

export const { setFieldValue, resetForm, submitForm } = formSlice.actions;
export default formSlice.reducer;
