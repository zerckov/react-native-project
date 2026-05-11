import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";
import { EmptyState } from "./EmptyState";

export function PendingTasksCard({ tasks, onPressAllTasks }) {
  const active = tasks.filter((item) => !item.done).length;
  const shouldScroll = tasks.length > 2;

  const getPriorityColor = (taskPriority) => {
    if (taskPriority === "Haute") {
      return "#c62828";
    }

    if (taskPriority === "Moyenne") {
      return "#e67e22";
    }

    if (taskPriority === "Basse") {
      return "#2e7d32";
    }

    return COLORS.muted;
  };

  return (
    <View style={[styles.wrapper, shouldScroll && styles.wrapperScrollable]}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Taches en attente</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{active} ACTIVES</Text>
        </View>
      </View>

      <ScrollView
        style={[styles.listShell, shouldScroll ? styles.listShellScrollable : styles.listShellCompact]}
        contentContainerStyle={[
          styles.listContent,
          !tasks.length && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {tasks.length ? (
          tasks.map((item) => (
            <View key={item.id} style={styles.taskRow}>
              <View style={styles.taskIcon}>
                <Feather name="edit-3" size={12} color={COLORS.accent} />
              </View>
              <View style={styles.taskTextWrap}>
                <Text style={styles.taskTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text
                  style={[styles.taskPriority, { color: getPriorityColor(item.priority) }]}
                  numberOfLines={1}
                >
                  Priorité : {item.priority || "Moyenne"}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState label="Aucune tâche en attente." />
        )}
      </ScrollView>

      <Pressable style={styles.button} onPress={onPressAllTasks}>
        <Text style={styles.buttonText}>Toutes les taches</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    backgroundColor: "#ecebe9",
    padding: 14,
    marginBottom: 20,
  },
  wrapperScrollable: {
    height: 270,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  taskRow: {
    backgroundColor: "#f6f5f4",
    borderRadius: 10,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  taskIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#f7ede7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  taskTextWrap: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  taskPriority: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  listShell: {
    alignSelf: "stretch",
    marginBottom: 8,
  },
  listShellScrollable: {
    flex: 1,
  },
  listShellCompact: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 2,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  button: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#dcb8a2",
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#a35527",
    fontSize: 13,
    fontWeight: "600",
  },
});
