import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export function SubjectResultCard({ subject }) {
  const progress = Math.max(0, Math.min(1, Number(subject.progress || 0)));
  const progressPercent = Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: subject.iconBg }]}>
          <MaterialCommunityIcons
            name={subject.icon}
            size={14}
            color={subject.iconColor}
          />
        </View>
        <Text style={styles.average}>{subject.average.toFixed(1)}</Text>
      </View>

      <Text style={styles.name}>{subject.name}</Text>
      <Text style={styles.subtitle}>{subject.subtitle}</Text>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Progression</Text>
        <Text style={styles.progressValue}>{progressPercent}%</Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: subject.progressColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: COLORS.card,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  average: {
    fontSize: 30 / 2,
    fontWeight: "700",
    color: COLORS.text,
  },
  name: {
    fontSize: 25 / 2,
    fontWeight: "600",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 3,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  progressValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "700",
  },
  progressTrack: {
    height: 4,
    width: "100%",
    borderRadius: 999,
    backgroundColor: "#e7e5e1",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    opacity: 0.75,
  },
});
