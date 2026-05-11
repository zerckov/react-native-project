import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export function AuthFormCard({
  mode,
  values,
  onChange,
  onSubmit,
  onSwitchMode,
  isLoading,
  errorMessage,
}) {
  const isSignup = mode === "signup";

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{isSignup ? "Créer un compte" : "Se connecter"}</Text>
      <Text style={styles.cardSubtitle}>
        {isSignup
          ? "Crée un accès local pour entrer dans l'application."
          : "Rentre avec ton compte existant pour ouvrir l'application."}
      </Text>

      {isSignup ? (
        <TextInput
          value={values.name}
          onChangeText={(text) => onChange({ name: text })}
          placeholder="Nom"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          autoCapitalize="words"
        />
      ) : null}

      <TextInput
        value={values.email}
        onChangeText={(text) => onChange({ email: text })}
        placeholder="Email"
        placeholderTextColor={COLORS.muted}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        value={values.password}
        onChangeText={(text) => onChange({ password: text })}
        placeholder="Mot de passe"
        placeholderTextColor={COLORS.muted}
        style={styles.input}
        secureTextEntry
      />

      {isSignup ? (
        <TextInput
          value={values.confirmPassword}
          onChangeText={(text) => onChange({ confirmPassword: text })}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          secureTextEntry
        />
      ) : null}

      <View style={styles.errorSlot}>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>

      <Pressable
        style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
        onPress={onSubmit}
        disabled={isLoading}
      >
        <MaterialCommunityIcons
          name={isSignup ? "account-plus-outline" : "login-variant"}
          size={18}
          color="#ffffff"
        />
        <Text style={styles.submitText}>{isLoading ? "Patiente..." : isSignup ? "Créer mon compte" : "Entrer"}</Text>
      </Pressable>

      <Pressable style={styles.linkButton} onPress={onSwitchMode}>
        <Text style={styles.linkText}>
          {isSignup ? "J'ai déjà un compte" : "Je veux créer un compte"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  cardSubtitle: {
    marginTop: 6,
    marginBottom: 14,
    color: COLORS.muted,
    lineHeight: 19,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: "#fbfcfb",
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
    color: COLORS.text,
  },
  error: {
    marginTop: 2,
    color: COLORS.danger,
    fontWeight: "600",
  },
  errorSlot: {
    minHeight: 26,
    justifyContent: "center",
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonPressed: {
    opacity: 0.88,
  },
  submitText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  linkButton: {
    marginTop: 12,
    alignItems: "center",
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});