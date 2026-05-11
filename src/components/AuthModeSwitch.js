import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export function AuthModeSwitch({ mode, onChangeMode }) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.option, mode === "login" && styles.optionActive]}
        onPress={() => onChangeMode("login")}
      >
        <Text style={[styles.optionText, mode === "login" && styles.optionTextActive]}>Connexion</Text>
      </Pressable>
      <Pressable
        style={[styles.option, mode === "signup" && styles.optionActive]}
        onPress={() => onChangeMode("signup")}
      >
        <Text style={[styles.optionText, mode === "signup" && styles.optionTextActive]}>Compte</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#eef4ef",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 11,
  },
  optionActive: {
    backgroundColor: COLORS.card,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  optionText: {
    color: COLORS.muted,
    fontWeight: "700",
  },
  optionTextActive: {
    color: COLORS.primary,
  },
});