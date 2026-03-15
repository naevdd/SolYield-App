import { useEffect, useState } from "react";
import { Text, View, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { database } from "@/db";
import FormSubmission from "@/db/FormSubmission";

export default function Submissions() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    database
      .get<FormSubmission>("form_submissions")
      .query()
      .fetch()
      .then((results) => {
        setSubmissions(results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-gray-400">Loading...</Text>
      </View>
    );
  }

  if (submissions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-3">
        <Ionicons name="document-outline" size={48} color="#CCC" />
        <Text className="text-base text-gray-400">No submissions yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-[#F8F9FA]"
      contentContainerClassName="p-5 pb-10"
      data={submissions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm elevation-2">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-[#1A1A2E]">{item.invertedSerial || "—"}</Text>
            <View className={`py-1 px-2.5 rounded-xl ${item.synced ? "bg-green-100" : "bg-yellow-50"}`}>
              <Text className="text-xs font-semibold text-gray-600">{item.synced ? "Synced" : "Pending"}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-1.5">
            <Text className="text-sm text-gray-400">Generation</Text>
            <Text className="text-sm text-gray-700 font-medium">{item.generation || "—"} kW</Text>
          </View>

          <View className="flex-row justify-between mb-1.5">
            <Text className="text-sm text-gray-400">Panel Condition</Text>
            <Text className="text-sm text-gray-700 font-medium">{item.panelCondition || "—"}</Text>
          </View>

          <View className="flex-row justify-between mb-1.5">
            <Text className="text-sm text-gray-400">Wiring</Text>
            <Text className="text-sm text-gray-700 font-medium">{item.wiringCheck || "—"}</Text>
          </View>

          {item.issues.length > 0 && (
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-sm text-gray-400">Issues</Text>
              <Text className="text-sm text-gray-700 font-medium flex-shrink text-right">{item.issues.join(", ")}</Text>
            </View>
          )}

          <Text className="text-xs text-gray-300 mt-2">{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      )}
    />
  );
}