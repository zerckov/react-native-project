import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export function PerformanceCard({ average, onPressViewBulletin }) {
  const quotes = [
    { text: "Celui qui avance avec confiance dans la direction de ses rêves connaîtra un succès inattendu dans la vie ordinaire.", author: "N.H. Kleinbaum" },
    { text: "Je préfère l'avenir au passé, car c'est là que j'ai décidé de vivre le restant de mes jours.", author: "Victor Hugo" },
    { text: "Tu avances à chaque pas, même les plus petits.", author: "Confucius" },
    { text: "L'impossible recule toujours quand on marche vers lui.", author: "Antoine de Saint-Exupéry" },
    { text: "Les grandes réussites commencent toujours par une bonne habitude.", author: "Aristote" },
  ];
  const quote = React.useMemo(
    () => quotes[Math.floor(Math.random() * quotes.length)],
    []
  );

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Ionicons name="document-text" size={11} color="#ffffff" />
        <Text style={styles.badgeText}>PERFORMANCE ACADEMIQUE</Text>
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.score}>{average.toFixed(1)}</Text>
        <Text style={styles.scoreTail}>/ 20</Text>
      </View>

      <Text style={styles.description}>{quote.text}</Text>
      <Text style={styles.quoteAuthor}>- {quote.author}</Text>

      <Pressable style={styles.button} onPress={onPressViewBulletin}>
        <Text style={styles.buttonText}>Voir le bulletin complet</Text>
        <Ionicons name="arrow-forward" size={14} color={COLORS.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: COLORS.primaryDark,
    padding: 22,
    marginBottom: 14,
    shadowColor: "#0e3f1b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    gap: 6,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 10,
    color: "#e5f0e6",
    letterSpacing: 1,
    fontWeight: "700",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  score: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 68,
    lineHeight: 72,
  },
  scoreTail: {
    color: "#dbefd9",
    fontWeight: "700",
    fontSize: 30,
    marginBottom: 10,
    marginLeft: 6,
  },
  description: {
    color: "#f2f8f1",
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 6,
    maxWidth: "92%",
  },
  quoteAuthor: {
    color: "#dbefd9",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 18,
  },
  button: {
    backgroundColor: "#f4f5f3",
    borderRadius: 20,
    alignSelf: "flex-start",
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
