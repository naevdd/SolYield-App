import { useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { formSchema } from "@/data/form_schema";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setFieldValue, resetForm, submitForm } from "@/store/formSlice";
import type { FormField } from "@/types";
import { useEffect } from "react";
import { database } from "@/db";
import FormSubmission from "@/db/FormSubmission";
import { useRouter } from "expo-router";

/* ------------------------------------------------------------------ */
/*  Field renderers                                                    */
/* ------------------------------------------------------------------ */

function TextField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder={field.placeholder ?? ""}
      placeholderTextColor="#AAA"
      value={value}
      onChangeText={onChange}
      keyboardType={field.type === "number" ? "numeric" : "default"}
    />
  );
}

function SelectField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.optionsWrap}>
      {(field.options ?? []).map((opt) => {
        const selected = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.selectChip, selected && styles.selectChipActive]}
            onPress={() => onChange(opt)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.selectChipText,
                selected && styles.selectChipTextActive,
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function RadioField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.radioGroup}>
      {(field.options ?? []).map((opt) => {
        const selected = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={styles.radioRow}
            onPress={() => onChange(opt)}
            activeOpacity={0.7}
          >
            <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
              {selected && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CheckboxField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    const next = value.includes(opt)
      ? value.filter((v) => v !== opt)
      : [...value, opt];
    onChange(next);
  };

  const isRow = field.display === "Row";

  return (
    <View style={isRow ? styles.checkboxRow : styles.checkboxCol}>
      {(field.options ?? []).map((opt) => {
        const checked = value.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={styles.checkboxItem}
            onPress={() => toggle(opt)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkboxBox, checked && styles.checkboxBoxActive]}
            >
              {checked && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text style={styles.checkboxLabel}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function FileField({ field }: { field: FormField }) {
  const dispatch = useAppDispatch();
  const [uri, setUri] = useState<string | null>(null);
  const [docName, setDocName] = useState<string | null>(null);

  const handleCapture = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Camera access is needed to capture photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setUri(compressed.uri);
      dispatch(setFieldValue({ fieldId: field.id, value: compressed.uri }));
    }
  }, [dispatch, field.id]);

  const handleUpload = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type:
        field.uploadFileType === "PDF" ? "application/pdf" : "image/*",
      multiple: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      setDocName(result.assets[0].name);
      setUri(result.assets[0].uri);
      dispatch(setFieldValue({ fieldId: field.id, value: result.assets[0].uri }));
    }
  }, [dispatch, field.id, field.uploadFileType]);

  const isCapture = field.uploadType === "Capture";

  return (
    <View>
      <TouchableOpacity
        style={styles.fileButton}
        onPress={isCapture ? handleCapture : handleUpload}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isCapture ? "camera-outline" : "cloud-upload-outline"}
          size={20}
          color="#4A90D9"
        />
        <Text style={styles.fileButtonText}>
          {isCapture ? "Take Photo" : "Choose File"}
        </Text>
      </TouchableOpacity>
      {uri && isCapture && (
        <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
      )}
      {docName && !isCapture && (
        <Text style={styles.fileName}>{docName}</Text>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Maintenance Screen                                            */
/* ------------------------------------------------------------------ */

function SubmittedScreen({ onReset }: { onReset: () => void }) {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    database.get<FormSubmission>("form_submissions")
      .query()
      .fetchCount()
      .then(setCount);
  }, []);

  return (
    <View style={styles.successContainer}>
      <Ionicons name="checkmark-circle" size={72} color="#27AE60" />
      <Text style={styles.successTitle}>Saved Offline</Text>
      <Text style={styles.successBody}>
        Your checklist has been stored locally and will sync when you're back online.
      </Text>
      <Text style={{ color: "#666", marginTop: 8 }}>
        {count} submission(s) saved locally
      </Text>
      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.7}>
        <Text style={styles.resetButtonText}>Submit Another</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: "#4A90D9", marginTop: 12 }]}
        onPress={() => router.push("/(screens)/submissions")}
        activeOpacity={0.7}
      >
        <Text style={styles.resetButtonText}>View Submissions</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Maintenance() {
  const dispatch = useAppDispatch();
  const formValues = useAppSelector((s) => s.form.values);
  const submitted = useAppSelector((s) => s.form.submitted);

  const saving = useAppSelector((s) => s.form.saving);
  const error  = useAppSelector((s) => s.form.error);

  const handleSubmit = useCallback(async () => {
    // Simple required-field validation
    const missing: string[] = [];
    for (const section of formSchema.sections) {
      for (const field of section.fields) {
        if (field.required) {
          const val = formValues[field.id];
          if (!val || (Array.isArray(val) && val.length === 0)) {
            missing.push(field.label);
          }
        }
      }
    }
    if (missing.length > 0) {
      Alert.alert(
        "Required Fields",
        `Please fill in:\n• ${missing.join("\n• ")}`
      );
      return;
    }
    await dispatch(submitForm());
  }, [dispatch, formValues]);

  const handleReset = useCallback(() => {
    dispatch(resetForm());
  }, [dispatch]);

  if (submitted) {
    return <SubmittedScreen onReset={handleReset} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.formTitle}>{formSchema.title}</Text>

      {formSchema.sections.map((section) => (
        <View key={section.id} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.fields.map((field) => {
            const val = formValues[field.id];

            return (
              <View key={field.id} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>
                  {field.label}
                  {field.required ? (
                    <Text style={styles.required}> *</Text>
                  ) : null}
                </Text>

                {(field.type === "text" || field.type === "number") && (
                  <TextField
                    field={field as FormField}
                    value={(val as string) ?? ""}
                    onChange={(v) =>
                      dispatch(setFieldValue({ fieldId: field.id, value: v }))
                    }
                  />
                )}

                {field.type === "select" && (
                  <SelectField
                    field={field as FormField}
                    value={(val as string) ?? ""}
                    onChange={(v) =>
                      dispatch(setFieldValue({ fieldId: field.id, value: v }))
                    }
                  />
                )}

                {field.type === "radio" && (
                  <RadioField
                    field={field as FormField}
                    value={(val as string) ?? ""}
                    onChange={(v) =>
                      dispatch(setFieldValue({ fieldId: field.id, value: v }))
                    }
                  />
                )}

                {field.type === "checkbox" && (
                  <CheckboxField
                    field={field as FormField}
                    value={(val as string[]) ?? []}
                    onChange={(v) =>
                      dispatch(setFieldValue({ fieldId: field.id, value: v }))
                    }
                  />
                )}

                {field.type === "file" && <FileField field={field as FormField} />}
              </View>
            );
          })}
        </View>
      ))}

      {/* Actions */}
      <TouchableOpacity
        style={[styles.submitButton, saving && { opacity: 0.6 }]}
        onPress={handleSubmit}
        activeOpacity={0.7}
        disabled={saving}
      >
        <Ionicons name="send-outline" size={18} color="#FFF" />
        <Text style={styles.submitText}>{saving ? "Saving..." : "Submit Checklist"}</Text>
      </TouchableOpacity>

      {error && (
        <Text style={{ color: "#E74C3C", textAlign: "center", marginTop: 8 }}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={styles.clearButton}
        onPress={handleReset}
        activeOpacity={0.7}
      >
        <Text style={styles.clearText}>Clear Form</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { padding: 20, paddingBottom: 40 },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 16,
  },

  /* Section */
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A90D9",
    marginBottom: 14,
  },

  /* Field */
  fieldWrap: { marginBottom: 18 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  required: { color: "#E74C3C" },

  /* Text / Number */
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1A1A2E",
    backgroundColor: "#FAFAFA",
  },

  /* Select chips */
  optionsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FAFAFA",
  },
  selectChipActive: { backgroundColor: "#4A90D9", borderColor: "#4A90D9" },
  selectChipText: { fontSize: 13, color: "#555" },
  selectChipTextActive: { color: "#FFF", fontWeight: "600" },

  /* Radio */
  radioGroup: { gap: 10 },
  radioRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CCC",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: "#4A90D9" },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4A90D9",
  },
  radioLabel: { fontSize: 14, color: "#333" },

  /* Checkbox */
  checkboxRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  checkboxCol: { gap: 10 },
  checkboxItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#CCC",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxActive: { backgroundColor: "#4A90D9", borderColor: "#4A90D9" },
  checkboxLabel: { fontSize: 14, color: "#333" },

  /* File */
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4A90D9",
    borderStyle: "dashed",
    backgroundColor: "#F0F6FF",
  },
  fileButtonText: { fontSize: 14, color: "#4A90D9", fontWeight: "600" },
  preview: { width: "100%", height: 180, borderRadius: 10, marginTop: 10 },
  fileName: { fontSize: 13, color: "#555", marginTop: 6 },

  /* Submit */
  submitButton: {
    backgroundColor: "#27AE60",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  submitText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  clearButton: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
  },
  clearText: { color: "#888", fontWeight: "600", fontSize: 14 },

  /* Success */
  successContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginTop: 16,
  },
  successBody: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: "#4A90D9",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 24,
  },
  resetButtonText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
