import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SyncStatus } from "@/hooks/useNetworkSync";

export function SyncBanner({ status }: { status: SyncStatus }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status.state !== "idle") {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [status.state]);

  if (status.state === "idle") return null;

  const config = {
    syncing: {
      bg: "#1A1A2E",
      icon: "sync-outline" as const,
      text: "Syncing offline forms...",
    },
    success: {
      bg: "#27AE60",
      icon: "checkmark-circle-outline" as const,
      text:
        status.state === "success"
          ? `Synced ${status.result.synced} form(s)${status.result.failed > 0 ? `, ${status.result.failed} failed` : ""}`
          : "",
    },
    error: {
      bg: "#E74C3C",
      icon: "alert-circle-outline" as const,
      text: status.state === "error" ? status.message : "",
    },
  }[status.state];

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 flex-row items-center gap-2 px-4 pt-12 pb-2.5 z-50"
      // backgroundColor must stay inline — dynamic value
      // eslint-disable-next-line react-native/no-inline-styles
      style={[{ opacity, backgroundColor: config.bg }]}
    >
      <Ionicons name={config.icon} size={18} color="#FFF" />
      <Text className="text-white text-sm font-semibold">{config.text}</Text>
    </Animated.View>
  );
}