import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
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
      <View style={styles.center}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  if (submissions.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="document-outline" size={48} color="#CCC" />
        <Text style={styles.emptyText}>No submissions yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={submissions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.serial}>{item.invertedSerial || "—"}</Text>
            <View style={[styles.badge, item.synced ? styles.badgeSynced : styles.badgePending]}>
              <Text style={styles.badgeText}>{item.synced ? "Synced" : "Pending"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Generation</Text>
            <Text style={styles.value}>{item.generation || "—"} kW</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Panel Condition</Text>
            <Text style={styles.value}>{item.panelCondition || "—"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Wiring</Text>
            <Text style={styles.value}>{item.wiringCheck || "—"}</Text>
          </View>

          {item.issues.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Issues</Text>
              <Text style={styles.value}>{item.issues.join(", ")}</Text>
            </View>
          )}

          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16, color: "#AAA" },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  serial: { fontSize: 16, fontWeight: "700", color: "#1A1A2E" },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgePending: { backgroundColor: "#FFF3CD" },
  badgeSynced: { backgroundColor: "#D4EDDA" },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#555" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { fontSize: 13, color: "#888" },
  value: { fontSize: 13, color: "#333", fontWeight: "500", flexShrink: 1, textAlign: "right" },

  date: { fontSize: 11, color: "#BBB", marginTop: 8 },
});