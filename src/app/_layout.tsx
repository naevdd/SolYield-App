import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { View, StyleSheet } from "react-native";
import { store } from "@/store";
import { useNetworkSync } from "@/hooks/useNetworkSync";
import { SyncBanner } from "@/components/SyncBanner";
import "../../global.css";

function AppContent() {
  const syncStatus = useNetworkSync();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(screens)" />
      </Stack>
      <SyncBanner status={syncStatus} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});