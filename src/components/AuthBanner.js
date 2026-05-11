import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export function AuthBanner({ title, subtitle }) {
  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />
      <Text style={styles.eyebrow}>Acces prive</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 28,
    padding: 20,
    overflow: "hidden",
  },
  eyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    color: "#ffffff",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
    maxWidth: 260,
  },
  subtitle: {
    marginTop: 10,
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 280,
  },
  topGlow: {
    position: "absolute",
    top: -70,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  bottomGlow: {
    position: "absolute",
    bottom: -65,
    left: -45,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});