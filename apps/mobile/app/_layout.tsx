import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerTitleStyle: { fontWeight: "600" } }}>
        <Stack.Screen name="index" options={{ title: "Inspections" }} />
        <Stack.Screen name="new" options={{ title: "New Inspection", presentation: "modal" }} />
        <Stack.Screen name="inspection/[id]" options={{ title: "Inspection" }} />
        <Stack.Screen name="inspection/[id]/camera" options={{ title: "Capture Photo" }} />
        <Stack.Screen name="inspection/[id]/suggestions" options={{ title: "AI Suggestions" }} />
        <Stack.Screen name="inspection/[id]/edit/four-point" options={{ title: "Edit 4-Point" }} />
        <Stack.Screen name="inspection/[id]/edit/wind-mit" options={{ title: "Edit Wind Mit" }} />
        <Stack.Screen name="inspection/[id]/report" options={{ title: "Report" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
