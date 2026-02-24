import { useCallback, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Calendar from "expo-calendar";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux"; 
import { setSynced } from "@/store/visitsSlice";
import type { EnrichedVisit } from "@/types";
import * as Linking from "expo-linking";

async function getDefaultCalendarId(): Promise<string | undefined> {
  const { status } = await Calendar.requestCalendarPermissionsAsync(); 
  if (status !== "granted") {
    Alert.alert("Permission Denied", "Calendar access is required.");
    return undefined;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  // 1. Look specifically for a Google/Gmail calendar
  const googleCal = calendars.find(
    (c) => 
      c.accessLevel === Calendar.CalendarAccessLevel.OWNER &&
      (c.source.name.includes("gmail.com") || c.source.type === "com.google")
  );

  if (googleCal) return googleCal.id;

  // 2. Fallback to the system default if no Google account is found
  if (Platform.OS === "ios") {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    return defaultCal.id;
  }

  // 3. Fallback to any writeable calendar (existing logic)
  const writeable = calendars.find((c) => c.accessLevel === Calendar.CalendarAccessLevel.OWNER);
  return writeable?.id;
}


function convertTo24h(time12h: string): string {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

const openEventInLocalCalendar = (startDate: Date) => {
  // Format date as milliseconds since epoch
  const time = startDate.getTime();
  // Android intent to open calendar at the event time
  const url = `content://com.android.calendar/time/${time}`;
  Linking.openURL(url);
};

export default function Agenda() {
  const dispatch = useAppDispatch();
  const visits = useAppSelector((state) => state.visits.list);
  const synced = useAppSelector((state) => state.visits.synced);
  const [syncing, setSyncing] = useState(false);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      const calendarId = await getDefaultCalendarId();
      if (!calendarId) {
        setSyncing(false);
        return;
      }

      for (const visit of visits) {
        const startDate = new Date(`${visit.date}T${convertTo24h(visit.time)}`);
        const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);

        await Calendar.createEventAsync(calendarId, {
          title: `${visit.title} – ${visit.siteName}`,
          startDate,
          endDate,
          location: `${visit.siteName} (${visit.location.lat}, ${visit.location.lng})`,
          notes: `Capacity: ${visit.capacity}`,
          timeZone: "Asia/Kolkata",
        });
      }

      dispatch(setSynced(true));
      Alert.alert("Synced!", `${visits.length} visit(s) added to your calendar.`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Sync Failed", message);
    } finally {
      setSyncing(false);
    }
  }, [visits, dispatch]);

  const renderVisit = useCallback(
    ({ item }: { item: EnrichedVisit }) => (
      <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => {
        const startDate = new Date(`${item.date}T${convertTo24h(item.time)}`);
        openEventInLocalCalendar(startDate);
      }}>
        <View style={styles.timeline}>
          <View style={styles.dot} />
          <View style={styles.line} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.siteName}>{item.siteName}</Text>
          <Text style={styles.visitTitle}>{item.title}</Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text style={styles.time}>
              {item.time} · {item.date}
            </Text>
          </View>
          {item.capacity ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.capacity}</Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      </TouchableOpacity>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today's Schedule</Text>
      <Text style={styles.date}>
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>

      <FlatList
        data={visits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderVisit}
      />

      <TouchableOpacity
        style={[styles.syncButton, synced && styles.syncButtonDone]}
        onPress={handleSync}
        disabled={syncing || synced}
        activeOpacity={0.7}
      >
        <Ionicons
          name={synced ? "checkmark-circle" : "sync-outline"}
          size={20}
          color="#FFF"
        />
        <Text style={styles.syncText}>
          {synced ? "Synced to Calendar" : syncing ? "Syncing…" : "Sync with Google Calendar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A2E",
  },
  date: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
    marginBottom: 24,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  timeline: {
    alignItems: "center",
    marginRight: 14,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4A90D9",
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#E0E0E0",
    marginTop: 4,
  },
  cardContent: {
    flex: 1,
  },
  siteName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
    marginBottom: 2,
  },
  visitTitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  time: {
    fontSize: 13,
    color: "#888",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#4A90D920",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    color: "#4A90D9",
    fontWeight: "600",
  },
  syncButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#4A90D9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  syncButtonDone: {
    backgroundColor: "#27AE60",
  },
  syncText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },
  openInCalendar: {
    position: "absolute",
    top: 30,
    right: 20,
    backgroundColor: "#4A90D9",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  openInCalendarText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
