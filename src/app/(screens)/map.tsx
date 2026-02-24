import { useRef, useMemo } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
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
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: deltaLat,
      longitudeDelta: deltaLng,
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        showsUserLocation
        showsMyLocationButton
      >
        {sites.map((site: Site) => (
          <Marker
            key={site.id}
            coordinate={{
              latitude: site.location.lat,
              longitude: site.location.lng,
            }}
            title={site.name}
            description={site.capacity}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{site.name}</Text>
                <Text style={styles.calloutCapacity}>{site.capacity}</Text>
                <Text style={styles.calloutCoords}>
                  {site.location.lat.toFixed(4)}°N, {site.location.lng.toFixed(4)}°E
                </Text>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() =>
                    openInMaps(site.location.lat, site.location.lng, site.name)
                  }
                >
                  <Ionicons name="navigate" size={14} color="#FFF" />
                  <Text style={styles.navButtonText}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Site list overlay */}
      <View style={styles.listOverlay}>
        <Text style={styles.heading}>
          {sites.length} Assigned Sites
        </Text>
        {sites.map((site: Site) => (
          <TouchableOpacity
            key={site.id}
            style={styles.siteRow}
            activeOpacity={0.7}
            onPress={() => {
              mapRef.current?.animateToRegion(
                {
                  latitude: site.location.lat,
                  longitude: site.location.lng,
                  latitudeDelta: 0.5,
                  longitudeDelta: 0.5,
                },
                800
              );
            }}
          >
            <View style={styles.siteIcon}>
              <Ionicons name="location" size={16} color="#27AE60" />
            </View>
            <View style={styles.siteInfo}>
              <Text style={styles.siteName}>{site.name}</Text>
              <Text style={styles.siteCapacity}>{site.capacity}</Text>
            </View>
            <TouchableOpacity
              style={styles.navBadge}
              onPress={() =>
                openInMaps(site.location.lat, site.location.lng, site.name)
              }
            >
              <Ionicons name="navigate" size={14} color="#FFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  callout: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 2,
  },
  calloutCapacity: {
    fontSize: 12,
    color: "#27AE60",
    fontWeight: "600",
    marginBottom: 2,
  },
  calloutCoords: {
    fontSize: 11,
    color: "#888",
    marginBottom: 10,
  },
  navButton: {
    flexDirection: "row",
    backgroundColor: "#27AE60",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  navButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
  },
  listOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 12,
  },
  siteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  siteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#27AE6015",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  siteCapacity: {
    fontSize: 12,
    color: "#888",
  },
  navBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#27AE60",
    justifyContent: "center",
    alignItems: "center",
  },
});
