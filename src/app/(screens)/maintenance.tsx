import { useState, useCallback, useEffect } from "react";
import {
  Text,
  View,
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
import { database } from "@/db";
import FormSubmission from "@/db/FormSubmission";
import { useRouter } from "expo-router";

/* ------------------------------------------------------------------ */
/*  Field renderers                                                    */
/* ------------------------------------------------------------------ */

function TextField({ field, value, onChange }: { field: FormField; value: string; onChange: (v: string) => void }) {
  return (
    <TextInput
      className="border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm text-[#1A1A2E] bg-[#FAFAFA]"
      placeholder={field.placeholder ?? ""}
      placeholderTextColor="#AAA"
      value={value}
      onChangeText={onChange}
      keyboardType={field.type === "number" ? "numeric" : "default"}
    />
  );
}

function SelectField({ field, value, onChange }: { field: FormField; value: string; onChange: (v: string) => void }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {(field.options ?? []).map((opt) => {
        const selected = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            className={`py-2 px-3.5 rounded-full border ${selected ? "bg-[#4A90D9] border-[#4A90D9]" : "bg-[#FAFAFA] border-gray-200"}`}
            onPress={() => onChange(opt)}
            activeOpacity={0.7}
          >
            <Text className={`text-sm ${selected ? "text-white font-semibold" : "text-gray-500"}`}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function RadioField({ field, value, onChange }: { field: FormField; value: string; onChange: (v: string) => void }) {
  return (
    <View className="gap-2.5">
      {(field.options ?? []).map((opt) => {
        const selected = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            className="flex-row items-center gap-2"
            onPress={() => onChange(opt)}
            activeOpacity={0.7}
          >
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selected ? "border-[#4A90D9]" : "border-gray-300"}`}>
              {selected && <View className="w-3 h-3 rounded-full bg-[#4A90D9]" />}
            </View>
            <Text className="text-sm text-gray-700">{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CheckboxField({ field, value, onChange }: { field: FormField; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => {
    const next = value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt];
    onChange(next);
  };
  const isRow = field.display === "Row";
  return (
    <View className={isRow ? "flex-row flex-wrap gap-3" : "gap-2.5"}>
      {(field.options ?? []).map((opt) => {
        const checked = value.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            className="flex-row items-center gap-2"
            onPress={() => toggle(opt)}
            activeOpacity={0.7}
          >
            <View className={`w-5 h-5 rounded border-2 items-center justify-center ${checked ? "bg-[#4A90D9] border-[#4A90D9]" : "border-gray-300"}`}>
              {checked && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text className="text-sm text-gray-700">{opt}</Text>
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
    const result = await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: true });
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
      type: field.uploadFileType === "PDF" ? "application/pdf" : "image/*",
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
        className="flex-row items-center gap-2 py-3 px-4 rounded-xl border border-dashed border-[#4A90D9] bg-blue-50"
        onPress={isCapture ? handleCapture : handleUpload}
        activeOpacity={0.7}
      >
        <Ionicons name={isCapture ? "camera-outline" : "cloud-upload-outline"} size={20} color="#4A90D9" />
        <Text className="text-sm text-[#4A90D9] font-semibold">{isCapture ? "Take Photo" : "Choose File"}</Text>
      </TouchableOpacity>
      {uri && isCapture && (
        <Image source={{ uri }} className="w-full h-44 rounded-xl mt-2.5" resizeMode="cover" />
      )}
      {docName && !isCapture && (
        <Text className="text-sm text-gray-500 mt-1.5">{docName}</Text>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Submitted Screen                                                   */
/* ------------------------------------------------------------------ */

function SubmittedScreen({ onReset }: { onReset: () => void }) {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    database.get<FormSubmission>("form_submissions").query().fetchCount().then(setCount);
  }, []);

  return (
    <View className="flex-1 bg-[#F8F9FA] items-center justify-center p-10">
      <Ionicons name="checkmark-circle" size={72} color="#27AE60" />
      <Text className="text-2xl font-bold text-[#1A1A2E] mt-4">Saved Offline</Text>
      <Text className="text-sm text-gray-500 text-center mt-2 leading-5">
        Your checklist has been stored locally and will sync when you're back online.
      </Text>
      <Text className="text-sm text-gray-500 mt-2">{count} submission(s) saved locally</Text>
      <TouchableOpacity
        className="bg-[#4A90D9] py-3.5 px-8 rounded-2xl mt-6"
        onPress={onReset}
        activeOpacity={0.7}
      >
        <Text className="text-white font-bold text-base">Submit Another</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-[#4A90D9] py-3.5 px-8 rounded-2xl mt-3"
        onPress={() => router.push("/(screens)/submissions")}
        activeOpacity={0.7}
      >
        <Text className="text-white font-bold text-base">View Submissions</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */

export default function Maintenance() {
  const dispatch = useAppDispatch();
  const formValues = useAppSelector((s) => s.form.values);
  const submitted = useAppSelector((s) => s.form.submitted);
  const saving = useAppSelector((s) => s.form.saving);
  const error = useAppSelector((s) => s.form.error);

  const handleSubmit = useCallback(async () => {
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
      Alert.alert("Required Fields", `Please fill in:\n• ${missing.join("\n• ")}`);
      return;
    }
    await dispatch(submitForm());
  }, [dispatch, formValues]);

  const handleReset = useCallback(() => {
    dispatch(resetForm());
  }, [dispatch]);

  if (submitted) return <SubmittedScreen onReset={handleReset} />;

  return (
    <ScrollView className="flex-1 bg-[#F8F9FA]" contentContainerClassName="p-5 pb-10">
      <Text className="text-2xl font-bold text-[#1A1A2E] mb-4">{formSchema.title}</Text>

      {formSchema.sections.map((section) => (
        <View key={section.id} className="bg-white rounded-2xl p-5 mb-4 shadow-sm elevation-2">
          <Text className="text-base font-bold text-[#4A90D9] mb-3.5">{section.title}</Text>

          {section.fields.map((field) => {
            const val = formValues[field.id];
            return (
              <View key={field.id} className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                  {field.label}
                  {field.required ? <Text className="text-red-500"> *</Text> : null}
                </Text>

                {(field.type === "text" || field.type === "number") && (
                  <TextField
                    field={field as FormField}
                    value={(val as string) ?? ""}
                    onChange={(v) => dispatch(setFieldValue({ fieldId: field.id, value: v }))}
                  />
                )}
                {field.type === "select" && (
                  <SelectField
                    field={field as FormField}
                    value={(val as string) ?? ""}
                    onChange={(v) => dispatch(setFieldValue({ fieldId: field.id, value: v }))}
                  />
                )}
                {field.type === "radio" && (
                  <RadioField
                    field={field as FormField}
                    value={(val as string) ?? ""}
                    onChange={(v) => dispatch(setFieldValue({ fieldId: field.id, value: v }))}
                  />
                )}
                {field.type === "checkbox" && (
                  <CheckboxField
                    field={field as FormField}
                    value={(val as string[]) ?? []}
                    onChange={(v) => dispatch(setFieldValue({ fieldId: field.id, value: v }))}
                  />
                )}
                {field.type === "file" && <FileField field={field as FormField} />}
              </View>
            );
          })}
        </View>
      ))}

      <TouchableOpacity
        className={`bg-[#27AE60] flex-row items-center justify-center gap-2 py-4 rounded-2xl mt-2 ${saving ? "opacity-60" : ""}`}
        onPress={handleSubmit}
        disabled={saving}
        activeOpacity={0.7}
      >
        <Ionicons name="send-outline" size={18} color="#FFF" />
        <Text className="text-white font-bold text-base">{saving ? "Saving..." : "Submit Checklist"}</Text>
      </TouchableOpacity>

      {error && <Text className="text-red-500 text-center mt-2">{error}</Text>}

      <TouchableOpacity className="items-center py-3.5 mt-2" onPress={handleReset} activeOpacity={0.7}>
        <Text className="text-gray-400 font-semibold text-sm">Clear Form</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}