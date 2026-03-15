import { useRef, useMemo } from "react";
import { Text, View, TouchableOpacity, Linking, Platform } from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { sites } from "@/data/sites";
import type { Site } from "@/types";

function openInMaps(lat: number, lng: number, name: string) {
  const url =
    Platform.OS === "ios"
      ? `maps://app?daddr=${lat},${lng}&q=${encodeURIComponent(name)}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  Linking.openURL(url);
}

export default function SiteMap() {
  const mapRef = useRef<MapView>(null);

  const initialRegion = useMemo(() => {
    const lats = sites.map((s: Site) => s.location.lat);
    const lngs = sites.map((s: Site) => s.location.lng);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const deltaLat = Math.max(...lats) - Math.min(...lats) + 2;
    const deltaLng = Math.max(...lngs) - Math.min(...lngs) + 2;
    return { latitude: centerLat, longitude: centerLng, latitudeDelta: deltaLat, longitudeDelta: deltaLng };
  }, []);

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        className="flex-1"
        initialRegion={initialRegion}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        showsUserLocation
        showsMyLocationButton
      >
        {sites.map((site: Site) => (
          <Marker
            key={site.id}
            coordinate={{ latitude: site.location.lat, longitude: site.location.lng }}
            title={site.name}
            description={site.capacity}
          >
            <Callout tooltip>
              <View className="bg-white rounded-xl p-3.5 w-48 shadow-md elevation-4">
                <Text className="text-base font-bold text-[#1A1A2E] mb-0.5">{site.name}</Text>
                <Text className="text-xs text-[#27AE60] font-semibold mb-0.5">{site.capacity}</Text>
                <Text className="text-xs text-gray-400 mb-2.5">
                  {site.location.lat.toFixed(4)}°N, {site.location.lng.toFixed(4)}°E
                </Text>
                <TouchableOpacity
                  className="flex-row bg-[#27AE60] rounded-lg py-1.5 px-3 items-center justify-center gap-1"
                  onPress={() => openInMaps(site.location.lat, site.location.lng, site.name)}
                >
                  <Ionicons name="navigate" size={14} color="#FFF" />
                  <Text className="text-white font-semibold text-sm">Navigate</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Site list overlay */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-lg elevation-8">
        <Text className="text-base font-bold text-[#1A1A2E] mb-3">{sites.length} Assigned Sites</Text>
        {sites.map((site: Site) => (
          <TouchableOpacity
            key={site.id}
            className="flex-row items-center py-2"
            activeOpacity={0.7}
            onPress={() => {
              mapRef.current?.animateToRegion(
                { latitude: site.location.lat, longitude: site.location.lng, latitudeDelta: 0.5, longitudeDelta: 0.5 },
                800
              );
            }}
          >
            <View className="w-8 h-8 rounded-full bg-green-50 justify-center items-center mr-2.5">
              <Ionicons name="location" size={16} color="#27AE60" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-[#1A1A2E]">{site.name}</Text>
              <Text className="text-xs text-gray-400">{site.capacity}</Text>
            </View>
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-[#27AE60] justify-center items-center"
              onPress={() => openInMaps(site.location.lat, site.location.lng, site.name)}
            >
              <Ionicons name="navigate" size={14} color="#FFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}