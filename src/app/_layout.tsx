import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "@/store";
import "../../global.css";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(screens)" />
      </Stack>
    </Provider>
  );
}
