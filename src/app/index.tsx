import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const MENU_ITEMS = [
  {
    title: "The Day's Agenda",
    subtitle: "Google Calendar Sync · My Visits",
    route: "/agenda" as const,
    icon: "calendar-outline" as const,
    color: "#4A90D9",
  },
  {
    title: '"I\'m Here!" Check-In',
    subtitle: "Geolocation & Geofencing",
    route: "/checkin" as const,
    icon: "location-outline" as const,
    color: "#E67E22",
  },
  {
    title: "Site Navigation",
    subtitle: "Interactive Maps · Assigned Sites",
    route: "/map" as const,
    icon: "map-outline" as const,
    color: "#27AE60",
  },
  {
    title: "The Report Card",
    subtitle: "PDF Generation & Analytics",
    route: "/report" as const,
    icon: "bar-chart-outline" as const,
    color: "#8E44AD",
  },
  {
    title: "Maintenance Form",
    subtitle: "Preventive Maintenance Checklist",
    route: "/maintenance" as const,
    icon: "clipboard-outline" as const,
    color: "#2C3E50",
  },
];

export default function Index() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>☀️ SolYield</Text>
        <Text style={styles.tagline}>Solar Farm Technician Portal</Text>
      </View>

      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push(item.route)}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.color + "20" }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A1A2E",
  },
  tagline: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "47%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: "#888",
  },
});
