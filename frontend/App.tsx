import { useState, useEffect } from "react";
import { StyleSheet, StatusBar, LogBox, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Tes composants
import CameraPage from "./components/CameraPage";
import Gallery from "./components/Gallery";
import Checklist from "./components/Checklist";

LogBox.ignoreLogs(["Sending"]);

const Tab = createBottomTabNavigator();

export default function App() {
  const [photos, setPhotos] = useState([]);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const fetchPhotos = async () => {
    if (!apiUrl) return;
    try {
      const response = await fetch(`${apiUrl}/photos?t=${Date.now()}`);
      if (response.ok) {
        const result = await response.json();
        setPhotos(result);
      }
    } catch (error) {
      console.log("Erreur chargement photos");
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Wrapper pour la Caméra
  const CameraScreen = ({ navigation }) => (
    <CameraPage
      apiUrl={apiUrl || ""}
      onSwitchToGallery={() => navigation.jumpTo("Galerie")} // jumpTo est mieux pour les onglets
    />
  );

  // Wrapper pour la Galerie
  const GalleryScreen = () => <Gallery photos={photos} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Camera"
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "black",
              borderTopColor: "#333",
              height: 60,
              paddingBottom: 5,
            },
            tabBarActiveTintColor: "#ff0055",
            tabBarInactiveTintColor: "gray",
          }}
        >
          {/* Onglet Missions */}
          <Tab.Screen
            name="Missions"
            component={Checklist}
            options={{
              tabBarIcon: ({ color }) => (
                <Ionicons name="checkbox-outline" size={24} color={color} />
              ),
            }}
          />

          {/* Onglet Caméra */}
          <Tab.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Ionicons name="camera" size={32} color={color} />
              ),
            }}
          />

          {/* Onglet Galerie */}
          <Tab.Screen
            name="Galerie"
            component={GalleryScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Ionicons name="images" size={24} color={color} />
              ),
            }}
            listeners={{
              tabPress: () => fetchPhotos(), // Recharge quand on clique
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
