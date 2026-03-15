import { Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const MENU_ITEMS = [
  {
    title: "The Day's Agenda",
    subtitle: "Google Calendar Sync · My Visits",
    route: "/agenda" as const,
    icon: "calendar-outline" as const,
    color: "#4A90D9",
    bg: "bg-blue-50",
  },
  {
    title: '"I\'m Here!" Check-In',
    subtitle: "Geolocation & Geofencing",
    route: "/checkin" as const,
    icon: "location-outline" as const,
    color: "#E67E22",
    bg: "bg-orange-50",
  },
  {
    title: "Site Navigation",
    subtitle: "Interactive Maps · Assigned Sites",
    route: "/map" as const,
    icon: "map-outline" as const,
    color: "#27AE60",
    bg: "bg-green-50",
  },
  {
    title: "The Report Card",
    subtitle: "PDF Generation & Analytics",
    route: "/report" as const,
    icon: "bar-chart-outline" as const,
    color: "#8E44AD",
    bg: "bg-purple-50",
  },
  {
    title: "Maintenance Form",
    subtitle: "Preventive Maintenance Checklist",
    route: "/maintenance" as const,
    icon: "clipboard-outline" as const,
    color: "#2C3E50",
    bg: "bg-gray-100",
  },
];

export default function Index() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-[#F8F9FA] pt-16 px-5">
      <View className="mb-8">
        <Text className="text-4xl font-bold text-[#1A1A2E]">☀️ SolYield</Text>
        <Text className="text-sm text-gray-500 mt-1">Solar Farm Technician Portal</Text>
      </View>

      <View className="flex-row flex-wrap justify-between gap-4">
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.route}
            className="bg-white rounded-2xl p-5 w-[47%] shadow-sm elevation-3"
            activeOpacity={0.7}
            onPress={() => router.push(item.route)}
          >
            <View className={`w-16 h-16 rounded-full justify-center mb-4 items-center ${item.bg}`}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <Text className="text-base font-semibold text-[#1A1A2E] mb-1">{item.title}</Text>
            <Text className="text-xs text-gray-400">{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}