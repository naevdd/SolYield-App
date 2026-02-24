import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Home",
        headerTintColor: "#1A1A2E",
        headerStyle: { backgroundColor: "#F8F9FA" },
      }}
    >
      <Stack.Screen name="agenda" options={{ title: "My Visits" }} />
      <Stack.Screen name="checkin" options={{ title: "Check-In" }} />
      <Stack.Screen name="map" options={{ title: "Site Navigation" }} />
      <Stack.Screen name="report" options={{ title: "Report Card" }} />
      <Stack.Screen name="maintenance" options={{ title: "Maintenance Form" }} />
    </Stack>
  );
}
