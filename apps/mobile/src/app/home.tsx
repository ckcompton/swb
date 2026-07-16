import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProfileById } from "@boxing-gym/data-access";
import { formatDisplayName } from "@boxing-gym/utils";
import { DESIGN_TOKENS } from "@boxing-gym/config";
import { useAuth } from "@/features/auth/auth-context";
import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
  const { session, isLoading } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getProfileById(supabase, session.user.id).then((profile) => {
      setDisplayName(profile ? formatDisplayName(profile.firstName, profile.lastName) : null);
    });
  }, [session]);

  if (!isLoading && !session) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>{DESIGN_TOKENS.siteName}</Text>
        <Text style={styles.title}>Welcome{displayName ? `, ${displayName}` : ""}</Text>
        <Text style={styles.subtitle}>You&apos;re logged in.</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => supabase.auth.signOut()}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: DESIGN_TOKENS.accentColor,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#a3a3a3",
    marginBottom: 24,
  },
  button: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
