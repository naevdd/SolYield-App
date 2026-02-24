import { useCallback } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { sites } from "@/data/sites";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import {
  setCheckInStatus,
  setActiveSite,
  checkInSuccess,
} from "@/store/checkInSlice";

const GEOFENCE_RADIUS_M = 500;

function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CheckIn() {
  const dispatch = useAppDispatch();
  const checkInStatus = useAppSelector((state) => state.checkIn.status);

  // Use first site — in production, derive from today's schedule
  const site = sites[0];
  const siteLocation = {
    name: site.name,
    latitude: site.location.lat,
    longitude: site.location.lng,
  };

  const handleCheckIn = useCallback(async () => {
    dispatch(setCheckInStatus("loading"));
    dispatch(setActiveSite(site.id));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required for check-in.");
        dispatch(setCheckInStatus("idle"));
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const distance = getDistanceMeters(
        location.coords.latitude,
        location.coords.longitude,
        siteLocation.latitude,
        siteLocation.longitude
      );

      if (distance <= GEOFENCE_RADIUS_M) {
        dispatch(checkInSuccess());
        Alert.alert(
          "Checked In!",
          `You're ${Math.round(distance)}m from ${siteLocation.name}.`
        );
      } else {
        dispatch(setCheckInStatus("error"));
        Alert.alert(
          "Out of Range",
          `You're ${Math.round(distance)}m away. Must be within ${GEOFENCE_RADIUS_M}m.`
        );
      }
    } catch (e: unknown) {
      dispatch(setCheckInStatus("error"));
      const message = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Error", message);
    }
  }, [dispatch, site.id, siteLocation]);

  return (
    <View style={styles.container}>
      <View style={styles.siteInfo}>
        <Ionicons name="business-outline" size={24} color="#E67E22" />
        <Text style={styles.siteName}>{siteLocation.name}</Text>
        <Text style={styles.coords}>
          {siteLocation.latitude.toFixed(4)}°N, {siteLocation.longitude.toFixed(4)}°E
        </Text>
        <Text style={styles.radius}>Required: within {GEOFENCE_RADIUS_M}m</Text>
      </View>

      <View style={styles.statusContainer}>
        {checkInStatus === "idle" && (
          <View style={styles.statusCircle}>
            <Ionicons name="location-outline" size={48} color="#CCC" />
            <Text style={styles.statusText}>Tap to check in</Text>
          </View>
        )}
        {checkInStatus === "loading" && (
          <View style={styles.statusCircle}>
            <Ionicons name="navigate-outline" size={48} color="#E67E22" />
            <Text style={styles.statusText}>Verifying location…</Text>
          </View>
        )}
        {checkInStatus === "success" && (
          <View style={[styles.statusCircle, styles.successCircle]}>
            <Ionicons name="checkmark-circle" size={64} color="#27AE60" />
            <Text style={[styles.statusText, styles.successText]}>Checked In!</Text>
          </View>
        )}
        {checkInStatus === "error" && (
          <View style={[styles.statusCircle, styles.errorCircle]}>
            <Ionicons name="close-circle" size={64} color="#E74C3C" />
            <Text style={[styles.statusText, styles.errorText]}>Out of range</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          checkInStatus === "loading" && styles.buttonDisabled,
          checkInStatus === "success" && styles.buttonSuccess,
        ]}
        onPress={handleCheckIn}
        disabled={checkInStatus === "loading" || checkInStatus === "success"}
        activeOpacity={0.7}
      >
        <Ionicons
          name={checkInStatus === "success" ? "checkmark" : "location"}
          size={22}
          color="#FFF"
        />
        <Text style={styles.buttonText}>
          {checkInStatus === "success" ? "Checked In" : "I'm Here!"}
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
    paddingTop: 24,
  },
  siteInfo: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  siteName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginTop: 8,
  },
  coords: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  radius: {
    fontSize: 12,
    color: "#E67E22",
    marginTop: 4,
    fontWeight: "500",
  },
  statusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E0E0E0",
  },
  successCircle: {
    borderColor: "#27AE60",
    backgroundColor: "#27AE6010",
  },
  errorCircle: {
    borderColor: "#E74C3C",
    backgroundColor: "#E74C3C10",
  },
  statusText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    fontWeight: "500",
  },
  successText: {
    color: "#27AE60",
  },
  errorText: {
    color: "#E74C3C",
  },
  button: {
    backgroundColor: "#E67E22",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonSuccess: {
    backgroundColor: "#27AE60",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 18,
  },
});
