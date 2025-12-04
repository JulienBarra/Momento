import { useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

interface CameraPageProps {
  apiUrl: string;
  onSwitchToGallery: () => void;
}

export default function CameraPage({
  apiUrl,
  onSwitchToGallery,
}: CameraPageProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // On gère les permissions d'abord
  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Besoin de la caméra ! 📸</Text>
        <Button onPress={requestPermission} title="Autoriser" />
      </View>
    );
  }

  const takeAndUploadPhoto = async () => {
    // 1. SÉCURITÉ CONFIG : On vérifie l'URL ici, au moment du clic
    if (!apiUrl) {
      Alert.alert(
        "Erreur Config",
        "La variable EXPO_PUBLIC_API_URL est vide !"
      );
      return;
    }

    if (!cameraRef.current) return;
    if (uploading) return;

    try {
      setUploading(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      if (!photo) return;

      const formData = new FormData();

      formData.append("photo", {
        uri: photo.uri,
        name: "photo_mariage.jpg",
        type: "image/jpeg",
      });

      formData.append("table_id", "1");
      formData.append("mission_id", "5");

      console.log("Envoi vers :", `${apiUrl}/photos`); // Pour débugger

      const response = await fetch(`${apiUrl}/photos`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // On tente de lire le JSON seulement si le serveur répond du JSON
      // Parfois une erreur 500 renvoie du HTML, ce qui fait planter response.json()
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { error: "Réponse serveur invalide", raw: responseText };
      }

      if (response.ok) {
        Alert.alert("Succès ! 🥳", "Photo envoyée dans le cloud !");
      } else {
        console.log("Erreur Backend:", result);
        Alert.alert(
          "Oups",
          "Erreur serveur: " + (result.message || JSON.stringify(result))
        );
      }
    } catch (error) {
      console.error("Erreur Réseau:", error);
      Alert.alert("Erreur", "Impossible de joindre le serveur. Vérifie l'IP !");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={takeAndUploadPhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <View style={styles.shutterBtn}>
                <Text style={styles.text}>📸</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
      <View style={{ position: "absolute", top: 50, right: 20 }}>
        <Button title="🖼️ Galerie" onPress={onSwitchToGallery} color="white" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  message: { textAlign: "center", paddingBottom: 10 },
  camera: { flex: 1 },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    marginBottom: 50,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  shutterBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(0,0,0,0.2)",
  },
  text: { fontSize: 24 },
});
