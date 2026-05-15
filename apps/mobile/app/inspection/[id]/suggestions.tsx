import { useCallback, useState } from "react";
import {
  ActivityIndicator, Alert, Pressable, ScrollView,
  StyleSheet, Text, View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { api, type Suggestion } from "../../../lib/api";

export default function Suggestions() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.getSuggestions(id!);
      setItems(r.suggestions);
      // Default-accept high-confidence non-conflicting items.
      const next = new Set<string>();
      for (const s of r.suggestions) {
        if (s.confidence >= 0.8 && !s.conflictsWithCurrent) {
          next.add(key(s));
        }
      }
      setAccepted(next);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const toggle = (s: Suggestion) => {
    setAccepted((cur) => {
      const next = new Set(cur);
      const k = key(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const apply = async () => {
    const payload = items
      .filter((s) => accepted.has(key(s)))
      .map((s) => ({ form: s.form, path: s.path, value: s.value }));
    if (payload.length === 0) {
      Alert.alert("Nothing selected", "Pick at least one suggestion.");
      return;
    }
    setApplying(true);
    try {
      await api.applySuggestions(id!, payload);
      router.back();
    } catch (e: any) {
      Alert.alert("Apply failed", e.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No AI suggestions yet.</Text>
        <Text style={styles.dim}>Capture photos in each section first.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.list}>
        {items.map((s) => {
          const isOn = accepted.has(key(s));
          return (
            <Pressable
              key={key(s)}
              style={[styles.card, isOn && styles.cardOn, s.conflictsWithCurrent && styles.cardConflict]}
              onPress={() => toggle(s)}
            >
              <View style={styles.cardHead}>
                <Text style={styles.path}>
                  {s.form === "windMit" ? "WM " : "4P "}
                  {s.path}
                </Text>
                <View style={[styles.box, isOn && styles.boxOn]}>
                  {isOn && <Text style={styles.check}>✓</Text>}
                </View>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.k}>Proposed</Text>
                <Text style={styles.v}>{String(s.value)}</Text>
              </View>
              {s.conflictsWithCurrent && (
                <View style={styles.kvRow}>
                  <Text style={[styles.k, { color: "#a44" }]}>Current</Text>
                  <Text style={[styles.v, { color: "#a44" }]}>{String(s.currentValue)}</Text>
                </View>
              )}
              <View style={styles.meta}>
                <Text style={styles.metaText}>
                  {Math.round(s.confidence * 100)}% · from {s.sourcePhotoTag}
                </Text>
                {s.notes && <Text style={styles.notes}>{s.notes}</Text>}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.count}>{accepted.size} of {items.length} selected</Text>
        <Pressable
          style={[styles.apply, (applying || accepted.size === 0) && { opacity: 0.5 }]}
          disabled={applying || accepted.size === 0}
          onPress={apply}
        >
          {applying ? <ActivityIndicator color="#fff" /> : <Text style={styles.applyText}>Apply</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const key = (s: Suggestion) => `${s.form}:${s.path}`;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  empty: { fontSize: 16, fontWeight: "600" },
  dim: { color: "#666", marginTop: 6 },
  list: { padding: 12, gap: 10, paddingBottom: 100 },
  card: {
    backgroundColor: "#fff", padding: 12, borderRadius: 10,
    borderWidth: 1, borderColor: "#e2e2e2",
  },
  cardOn: { borderColor: "#0a66ff", backgroundColor: "#f0f6ff" },
  cardConflict: { borderColor: "#e1b94a", backgroundColor: "#fffaee" },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  path: { fontFamily: "Menlo", fontSize: 13, fontWeight: "600" },
  box: {
    width: 24, height: 24, borderRadius: 5,
    borderWidth: 1.5, borderColor: "#aaa",
    alignItems: "center", justifyContent: "center",
  },
  boxOn: { backgroundColor: "#0a66ff", borderColor: "#0a66ff" },
  check: { color: "#fff", fontWeight: "700" },
  kvRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  k: { color: "#666" },
  v: { fontWeight: "500" },
  meta: { marginTop: 8 },
  metaText: { color: "#888", fontSize: 12 },
  notes: { color: "#666", fontSize: 12, marginTop: 4, fontStyle: "italic" },
  footer: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    padding: 12, backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: "#ccc",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  count: { color: "#666" },
  apply: {
    backgroundColor: "#0a66ff", paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 8,
  },
  applyText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
