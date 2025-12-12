import { useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

interface CameraPageProps {
  apiUrl: string;
  onSwitchToGallery: () => void;
}

export default function CameraPage({ apiUrl }: CameraPageProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Gère les permissions de la caméra
  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Besoin de la caméra ! 📸</Text>
        <Button onPress={requestPermission} title="Autoriser" />
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      if (photo) {
        setPhotoUri(photo.uri);
        console.log("Photo prise !", `URI: ${photo.uri}`);
      }
    } catch (error) {
      console.error("Erreur lors de la prise de photo:", error);
      Alert.alert("Erreur", "Impossible de prendre la photo.");
    }
  };

  // On accepte un mission ID ou null si c'est hors mission
  const uploadPhoto = async (missionId: string | null) => {
    if (!photoUri || !apiUrl) return;
    if (uploading) return;

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("photo", {
        uri: photoUri,
        name: "photo_mariage.jpg",
        type: "image/jpeg",
      });

      formData.append("table_id", "1");
      if (missionId) {
        formData.append("mission_id", missionId);
      }

      console.log("Envoi vers :", `${apiUrl}/photos`); // DEBUG

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
      {photoUri ? (
        // ------------------------------------------------
        // CAS 1 : On a une photo -> On affiche la PREVIEW
        // ------------------------------------------------
        <View style={styles.container}>
          <Image source={{ uri: photoUri }} style={styles.camera} />

          {/* Les boutons de décision par-dessus */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "red" }]}
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.text}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "green" }]}
              onPress={() => uploadPhoto(null)}
            >
              <Text style={styles.text}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // ------------------------------------------------
        // CAS 2 : Pas de photo -> On affiche la CAMÉRA
        // ------------------------------------------------
        <CameraView style={styles.camera} facing="back" ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={takePhoto}
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
      )}
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    marginBottom: 30,
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
