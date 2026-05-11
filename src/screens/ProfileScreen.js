import React, { useState } from "react";
import { Image, View, Text, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { COLORS } from "../theme/colors";

export function ProfileScreen({
  profile,
  onPickProfilePhoto,
  onUpdatePassword,
  stats,
  onLogout,
  onScroll,
  onScrollBeginDrag,
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);

  const handleSavePassword = async () => {
    const cleanOldPassword = oldPassword.trim();
    const cleanNewPassword = newPassword.trim();
    const cleanConfirmNewPassword = confirmNewPassword.trim();

    setPasswordError("");
    setPasswordSuccess("");

    if (!cleanOldPassword || !cleanNewPassword || !cleanConfirmNewPassword) {
      setPasswordError("Renseigne l'ancien mot de passe et le nouveau mot de passe.");
      return;
    }

    if (cleanNewPassword !== cleanConfirmNewPassword) {
      setPasswordError("La confirmation du nouveau mot de passe est incorrecte.");
      return;
    }

    if (cleanOldPassword === cleanNewPassword) {
      setPasswordError("Le nouveau mot de passe doit être différent de l'ancien.");
      return;
    }

    try {
      setIsSavingPassword(true);
      await onUpdatePassword?.({ oldPassword: cleanOldPassword, nextPassword: cleanNewPassword });
      setNewPassword("");
      setOldPassword("");
      setConfirmNewPassword("");
      setPasswordSuccess("Mot de passe mis à jour.");
    } catch (error) {
      if (error?.message === "INVALID_CREDENTIALS") {
        setPasswordError("L'ancien mot de passe est incorrect.");
      } else if (error?.message === "INVALID_INPUT") {
        setPasswordError("Renseigne tous les champs requis.");
      } else {
        setPasswordError("Impossible de mettre à jour le mot de passe.");
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      scrollEventThrottle={16}
    >
      <Text style={styles.title}>Profil</Text>

      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          {profile.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{profile.photoLabel}</Text>
          )}
        </View>
        <Pressable
          style={styles.photoButton}
          onPress={onPickProfilePhoto}
        >
          <Text style={styles.photoButtonText}>Changer photo</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Nom d'utilisateur</Text>
      <View style={[styles.input, styles.readOnlyField]}>
        <Text style={styles.readOnlyText}>{profile.name}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.passwordToggleButton, pressed && styles.passwordToggleButtonPressed]}
        onPress={() => setIsPasswordFormVisible((currentValue) => !currentValue)}
      >
        <Text style={styles.passwordToggleButtonText}>
          {isPasswordFormVisible ? "Masquer section mot de passe" : "Modifier mon mot de passe"}
        </Text>
      </Pressable>

      {isPasswordFormVisible ? (
        <View style={styles.passwordBlock}>
          <Text style={styles.label}>Ancien mot de passe</Text>
          <TextInput
            value={oldPassword}
            onChangeText={setOldPassword}
            style={[styles.input, styles.passwordInput]}
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            importantForAutofill="no"
            textContentType="password"
            secureTextEntry
            placeholder="Ancien mot de passe"
            placeholderTextColor={COLORS.muted}
          />

          <Text style={styles.label}>Nouveau mot de passe</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            style={[styles.input, styles.passwordInput]}
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            importantForAutofill="no"
            textContentType="newPassword"
            secureTextEntry
            placeholder="Saisis un nouveau mot de passe"
            placeholderTextColor={COLORS.muted}
          />

          <Text style={styles.label}>Confirmation du nouveau mot de passe</Text>
          <TextInput
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            style={[styles.input, styles.passwordInput]}
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            importantForAutofill="no"
            textContentType="newPassword"
            secureTextEntry
            placeholder="Confirme le nouveau mot de passe"
            placeholderTextColor={COLORS.muted}
          />

          <Pressable
            style={({ pressed }) => [
              styles.passwordButton,
              pressed && styles.passwordButtonPressed,
              isSavingPassword && styles.passwordButtonDisabled,
            ]}
            onPress={handleSavePassword}
            disabled={isSavingPassword}
          >
            <Text style={styles.passwordButtonText}>
              {isSavingPassword ? "Enregistrement..." : "Mettre à jour le mot de passe"}
            </Text>
          </Pressable>

          {passwordError ? <Text style={styles.passwordError}>{passwordError}</Text> : null}
          {passwordSuccess ? <Text style={styles.passwordSuccess}>{passwordSuccess}</Text> : null}
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Nombre de matières</Text>
          <Text style={styles.statValue}>{stats.subjects}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Moyenne generale</Text>
          <Text style={styles.statValue}>{stats.average.toFixed(2)}</Text>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Se deconnecter</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 14,
    paddingBottom: 110,
  },
  title: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 26,
    color: COLORS.text,
    fontWeight: "700",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 18,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  photoButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#b8d1be",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  photoButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  label: {
    color: COLORS.muted,
    marginBottom: 5,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#fbfcfb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: COLORS.text,
  },
  passwordInputWrap: {
    position: "relative",
    marginBottom: 10,
  },
  passwordInput: {
    marginBottom: 0,
  },
  readOnlyField: {
    justifyContent: "center",
    minHeight: 42,
    marginBottom: 2,
  },
  readOnlyText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  passwordToggleButton: {
    marginTop: 10,
    backgroundColor: "#edf6ef",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cfe2d4",
  },
  passwordToggleButtonPressed: {
    opacity: 0.9,
  },
  passwordToggleButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  passwordBlock: {
    marginTop: 12,
  },
  passwordButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  passwordButtonPressed: {
    opacity: 0.9,
  },
  passwordButtonDisabled: {
    opacity: 0.7,
  },
  passwordButtonText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  passwordError: {
    marginTop: 10,
    color: COLORS.danger,
    fontWeight: "600",
  },
  passwordSuccess: {
    marginTop: 8,
    color: COLORS.primary,
    fontWeight: "600",
  },
  statsRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    padding: 12,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },
  statValue: {
    marginTop: 6,
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "700",
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: "#fff1ef",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontWeight: "800",
  },
});
