import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export function EmptyState({ label }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    backgroundColor: "#f8f8f8",
  },
  text: {
    color: COLORS.muted,
    textAlign: "center",
  },
});
