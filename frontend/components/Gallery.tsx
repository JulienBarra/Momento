import {
  FlatList,
  View,
  Image,
  Dimensions,
  StyleSheet,
  ListRenderItem,
} from "react-native";

export interface Photo {
  id: number;
  filePath: string;
  table_id?: number;
  guest_name?: string;
}

interface GalleryProps {
  photos: Photo[];
}

const screenWidth = Dimensions.get("window").width;
const photoSize = screenWidth / 3;

export default function Gallery({ photos }: GalleryProps) {
  const minIOBaseUrl = process.env.EXPO_PUBLIC_MINIO_URL;

  const renderOnePhoto: ListRenderItem<Photo> = ({ item }) => {
    if (!minIOBaseUrl) return null;
    
    const fullUrl = `${minIOBaseUrl}/${item.filePath}`;
    return (
      <Image
        source={{ uri: fullUrl }}
        style={{ width: photoSize, height: photoSize }}
        resizeMode="cover"
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        renderItem={renderOnePhoto}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
