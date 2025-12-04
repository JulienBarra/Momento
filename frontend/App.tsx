import { useState, useEffect } from "react";
import { StyleSheet, View, Button, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraPage from "./components/CameraPage";
import Gallery, { Photo } from "./components/Gallery";

export default function App() {
  const [showGallery, setShowGallery] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  // 2. Le Chargement des Données
  useEffect(() => {
    // Si pas d'URL, on ne fait rien
    if (!apiUrl) return;

    const fetchPhotos = async () => {
      try {
        // LOG 1
        console.log("Tentative de récupération sur :", `${apiUrl}/photos`);
        const response = await fetch(`${apiUrl}/photos`);
        if (!response.ok) {
          throw new Error("Erreur réseau lors de la récupération des photos");
        }
        const result = await response.json();
        console.log("Données reçues :", result);
        // LOG 2
        setPhotos(result);
      } catch (error) {
        Alert.alert(
          "Erreur",
          "Impossible de charger les photos depuis le serveur."
        );
      }
    };

    // On recharge les photos à chaque fois qu'on affiche la galerie
    if (showGallery) {
      fetchPhotos();
    }
  }, [showGallery, apiUrl]);

  // 3. L'Affichage Conditionnel
  return (
    <SafeAreaView style={styles.container}>
      {showGallery ? (
        // MODE GALERIE
        <View style={{ flex: 1 }}>
          <Gallery photos={photos} />
          {/* Bouton pour revenir à la caméra */}
          <Button title="Caméra" onPress={() => setShowGallery(false)} />
        </View>
      ) : (
        <CameraPage
          apiUrl={apiUrl || ""}
          onSwitchToGallery={() => setShowGallery(true)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black", // Fond noir pour faire ressortir les photos
  },
});
