import { View, Text, StyleSheet } from "react-native";

export default function Checklist() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Missions</Text>
      <Text style={styles.text}>Liste des défis à venir !</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, color: "white", marginBottom: 10 },
  text: { color: "gray" },
});
