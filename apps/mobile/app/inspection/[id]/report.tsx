import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api } from "../../../lib/api";

export default function Report() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const open = (type: "four_point" | "wind_mitigation" | "both") => {
    Linking.openURL(api.pdfUrl(id!, type));
  };

  return (
    <View style={styles.root}>
      <Text style={styles.h1}>Generate report</Text>
      <Text style={styles.p}>Opens a server-generated PDF in your browser.</Text>

      <Pressable style={styles.btn} onPress={() => open("four_point")}>
        <Text style={styles.btnText}>4-Point PDF</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={() => open("wind_mitigation")}>
        <Text style={styles.btnText}>Wind Mitigation PDF</Text>
      </Pressable>
      <Pressable style={[styles.btn, { backgroundColor: "#222" }]} onPress={() => open("both")}>
        <Text style={styles.btnText}>Combined PDF</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: "700" },
  p: { color: "#666" },
  btn: { backgroundColor: "#0a66ff", padding: 14, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
