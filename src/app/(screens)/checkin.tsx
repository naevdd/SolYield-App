import { useCallback } from "react";
import { Text, View, TouchableOpacity, Alert } from "react-native";
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
        Alert.alert("Checked In!", `You're ${Math.round(distance)}m from ${siteLocation.name}.`);
      } else {
        dispatch(setCheckInStatus("error"));
        Alert.alert("Out of Range", `You're ${Math.round(distance)}m away. Must be within ${GEOFENCE_RADIUS_M}m.`);
      }
    } catch (e: unknown) {
      dispatch(setCheckInStatus("error"));
      const message = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Error", message);
    }
  }, [dispatch, site.id, siteLocation]);

  const isLoading = checkInStatus === "loading";
  const isSuccess = checkInStatus === "success";
  const isError = checkInStatus === "error";

  return (
    <View className="flex-1 bg-[#F8F9FA] px-5 pt-6">
      {/* Site Info Card */}
      <View className="bg-white rounded-2xl p-5 items-center shadow-sm elevation-2">
        <Ionicons name="business-outline" size={24} color="#E67E22" />
        <Text className="text-xl font-bold text-[#1A1A2E] mt-2">{siteLocation.name}</Text>
        <Text className="text-sm text-gray-400 mt-1">
          {siteLocation.latitude.toFixed(4)}°N, {siteLocation.longitude.toFixed(4)}°E
        </Text>
        <Text className="text-xs text-[#E67E22] font-medium mt-1">
          Required: within {GEOFENCE_RADIUS_M}m
        </Text>
      </View>

      {/* Status Circle */}
      <View className="flex-1 justify-center items-center">
        <View
          className={`w-44 h-44 rounded-full justify-center items-center border-[3px] ${
            isSuccess
              ? "border-[#27AE60] bg-green-50"
              : isError
              ? "border-[#E74C3C] bg-red-50"
              : "border-gray-200 bg-white"
          }`}
        >
          {isSuccess ? (
            <>
              <Ionicons name="checkmark-circle" size={64} color="#27AE60" />
              <Text className="text-sm text-[#27AE60] font-medium mt-2">Checked In!</Text>
            </>
          ) : isError ? (
            <>
              <Ionicons name="close-circle" size={64} color="#E74C3C" />
              <Text className="text-sm text-[#E74C3C] font-medium mt-2">Out of range</Text>
            </>
          ) : isLoading ? (
            <>
              <Ionicons name="navigate-outline" size={48} color="#E67E22" />
              <Text className="text-sm text-gray-400 font-medium mt-2">Verifying location…</Text>
            </>
          ) : (
            <>
              <Ionicons name="location-outline" size={48} color="#CCC" />
              <Text className="text-sm text-gray-400 font-medium mt-2">Tap to check in</Text>
            </>
          )}
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity
        className={`flex-row items-center justify-center gap-2 py-4 rounded-2xl mb-8 ${
          isSuccess ? "bg-[#27AE60]" : "bg-[#E67E22]"
        } ${isLoading ? "opacity-60" : ""}`}
        onPress={handleCheckIn}
        disabled={isLoading || isSuccess}
        activeOpacity={0.7}
      >
        <Ionicons name={isSuccess ? "checkmark" : "location"} size={22} color="#FFF" />
        <Text className="text-white font-bold text-lg">
          {isSuccess ? "Checked In" : "I'm Here!"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}