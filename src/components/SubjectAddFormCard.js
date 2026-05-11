import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export function SubjectAddFormCard({
  name,
  coef,
  onChangeName,
  onChangeCoef,
  onSubmit,
  onClose,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Ajouter une matière</Text>
          <Text style={styles.subtitle}>Crée une nouvelle matière avec son coefficient.</Text>
        </View>
        <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={18} color={COLORS.text} />
        </Pressable>
      </View>

      <TextInput
        placeholder="Nom de la matière"
        value={name}
        onChangeText={onChangeName}
        style={styles.input}
        placeholderTextColor={COLORS.muted}
      />
      <Text style={styles.inputLabel}>Coefficient</Text>
      <TextInput
        placeholder="Coefficient"
        value={coef}
        onChangeText={onChangeCoef}
        style={styles.input}
        keyboardType="numeric"
        inputMode="numeric"
        placeholderTextColor={COLORS.muted}
      />
      <Pressable style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Ajouter une matière</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  headerRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#ffffff",
  },
  inputLabel: {
    marginBottom: 6,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
