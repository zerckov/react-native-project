import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export function SectionHeader({ title, actionText }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionText ? <Text style={styles.action}>{actionText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    lineHeight: 38,
    fontWeight: "800",
    color: COLORS.text,
    maxWidth: "70%",
  },
  action: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
    borderBottomWidth: 1,
    borderBottomColor: "#b9d0bf",
    paddingBottom: 4,
  },
});
