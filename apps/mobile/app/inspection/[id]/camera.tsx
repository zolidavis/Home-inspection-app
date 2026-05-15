import { useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Pressable,
  StyleSheet, Text, View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../../lib/api";

export default function Camera() {
  const { id, tag } = useLocalSearchParams<{ id: string; tag: string }>();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  if (!permission) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Camera permission required.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  const capture = async () => {
    if (!camRef.current || busy) return;
    setBusy(true); setAiSummary(null);
    try {
      const photo = await camRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) throw new Error("no photo");
      const uploaded = await api.uploadPhoto({
        inspectionId: id!, tag: tag!, uri: photo.uri,
      });
      const analysis = await api.analyzePhoto(uploaded.id);
      setAiSummary(analysis.summary);
    } catch (e: any) {
      Alert.alert("Capture failed", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView ref={camRef} style={{ flex: 1 }} facing="back" />
      <View style={styles.overlay}>
        <Text style={styles.tag}>{tag}</Text>
        {aiSummary && <Text style={styles.aiText} numberOfLines={3}>{aiSummary}</Text>}
        <View style={styles.controls}>
          <Pressable style={styles.secondary} onPress={() => router.back()}>
            <Text style={styles.secondaryText}>Done</Text>
          </Pressable>
          <Pressable style={[styles.shutter, busy && { opacity: 0.5 }]} disabled={busy} onPress={capture}>
            {busy ? <ActivityIndicator color="#000" /> : <View style={styles.shutterInner} />}
          </Pressable>
          <View style={{ width: 80 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  msg: { fontSize: 16, marginBottom: 12 },
  overlay: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    padding: 16, backgroundColor: "rgba(0,0,0,0.45)",
  },
  tag: { color: "#fff", fontWeight: "600", marginBottom: 8 },
  aiText: { color: "#fff", marginBottom: 12, fontSize: 12 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  shutter: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "rgba(255,255,255,0.6)",
  },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff" },
  secondary: {
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8, width: 80, alignItems: "center",
  },
  secondaryText: { color: "#fff", fontWeight: "600" },
  button: { backgroundColor: "#0a66ff", padding: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
