import { useCallback, useState } from "react";
import {
  Text,
  View,
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

  const googleCal = calendars.find(
    (c) =>
      c.accessLevel === Calendar.CalendarAccessLevel.OWNER &&
      (c.source.name.includes("gmail.com") || c.source.type === "com.google")
  );

  if (googleCal) return googleCal.id;

  if (Platform.OS === "ios") {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    return defaultCal.id;
  }

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
  const time = startDate.getTime();
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
      if (!calendarId) { setSyncing(false); return; }

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
      <TouchableOpacity
        className="flex-row items-center bg-white rounded-2xl p-4 mb-3 shadow-sm elevation-2"
        activeOpacity={0.7}
        onPress={() => {
          const startDate = new Date(`${item.date}T${convertTo24h(item.time)}`);
          openEventInLocalCalendar(startDate);
        }}
      >
        <View className="items-center mr-3.5">
          <View className="w-3 h-3 rounded-full bg-[#4A90D9]" />
          <View className="w-0.5 flex-1 bg-gray-200 mt-1" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-[#1A1A2E] mb-0.5">{item.siteName}</Text>
          <Text className="text-sm text-gray-500 mb-1">{item.title}</Text>
          <View className="flex-row items-center gap-1 mb-2">
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text className="text-sm text-gray-400">{item.time} · {item.date}</Text>
          </View>
          {item.capacity ? (
            <View className="self-start bg-blue-50 px-2.5 py-0.5 rounded-xl">
              <Text className="text-xs text-[#4A90D9] font-semibold">{item.capacity}</Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      </TouchableOpacity>
    ),
    []
  );

  return (
    <View className="flex-1 bg-[#F8F9FA] px-5 pt-4">
      <Text className="text-2xl font-bold text-[#1A1A2E]">Today's Schedule</Text>
      <Text className="text-sm text-gray-400 mt-1 mb-6">
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
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={renderVisit}
      />

      <TouchableOpacity
        className={`absolute bottom-8 left-5 right-5 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl ${synced ? "bg-[#27AE60]" : "bg-[#4A90D9]"}`}
        onPress={handleSync}
        disabled={syncing || synced}
        activeOpacity={0.7}
      >
        <Ionicons
          name={synced ? "checkmark-circle" : "sync-outline"}
          size={20}
          color="#FFF"
        />
        <Text className="text-white font-semibold text-base">
          {synced ? "Synced to Calendar" : syncing ? "Syncing…" : "Sync with Google Calendar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}