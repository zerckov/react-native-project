import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";
import { EmptyState } from "../components/EmptyState";

export function TasksScreen({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onScroll,
  onScrollBeginDrag,
}) {
  const [value, setValue] = useState("");
  const [priority, setPriority] = useState("");

  const priorities = ["Haute", "Moyenne", "Basse"];

  const togglePriority = (selectedPriority) => {
    setPriority((currentPriority) =>
      currentPriority === selectedPriority ? "" : selectedPriority
    );
  };

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

  const submit = () => {
    const cleaned = value.trim();
    if (!cleaned) {
      return;
    }
    onAddTask(cleaned, priority.trim());
    setValue("");
    setPriority("");
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Mes taches</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Ajouter une tache"
          style={styles.input}
          placeholderTextColor={COLORS.muted}
        />
        <Pressable style={styles.addButton} onPress={submit}>
          <Ionicons name="add" size={20} color="#ffffff" />
        </Pressable>
      </View>

      <Text style={styles.priorityLabel}>Priorité</Text>
      <View style={styles.priorityRow}>
        {priorities.map((item) => {
          const active = priority === item;

          return (
            <Pressable
              key={item}
              style={[styles.priorityChip, active && styles.priorityChipActive]}
              onPress={() => togglePriority(item)}
            >
              <View style={[styles.priorityCheck, active && styles.priorityCheckActive]}>
                {active ? <Ionicons name="checkmark" size={11} color="#ffffff" /> : null}
              </View>
              <Text style={[styles.priorityChipText, active && styles.priorityChipTextActive]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState label="Aucune tache" />}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <Pressable
              style={[styles.check, item.done && styles.checkDone]}
              onPress={() => onToggleTask(item.id)}
            >
              {item.done ? <Ionicons name="checkmark" size={13} color="#ffffff" /> : null}
            </Pressable>
            <View style={styles.taskMain}>
              <Text style={[styles.taskText, item.done && styles.taskTextDone]}>{item.title}</Text>
              {item.priority ? (
                <Text style={[styles.taskPriority, { color: getPriorityColor(item.priority) }]}>
                  Priorité : {item.priority}
                </Text>
              ) : null}
            </View>
            <Pressable onPress={() => onDeleteTask(item.id)}>
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 110,
  },
  title: {
    marginTop: 6,
    fontSize: 26,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
  },
  addButton: {
    width: 42,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  priorityLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  priorityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  priorityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
  },
  priorityChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#edf6ef",
  },
  priorityCheck: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  priorityCheckActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  priorityChipText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  priorityChipTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 10,
  },
  taskRow: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkDone: {
    backgroundColor: COLORS.primary,
  },
  taskMain: {
    flex: 1,
  },
  taskText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  taskTextDone: {
    textDecorationLine: "line-through",
    color: COLORS.muted,
  },
  taskPriority: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.muted,
  },
});
