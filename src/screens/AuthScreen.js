import React, { useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthBanner } from "../components/AuthBanner";
import { AuthFormCard } from "../components/AuthFormCard";
import { AuthModeSwitch } from "../components/AuthModeSwitch";
import { COLORS } from "../theme/colors";

export function AuthScreen({ onSubmit, isLoading, errorMessage, onClearError }) {
  const [mode, setMode] = useState("login");
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState("");
  const submitLockRef = useRef(false);

  const bannerCopy = useMemo(() => {
    if (mode === "signup") {
      return {
        title: "Crée ton accès",
        subtitle: "Un compte local permet de retrouver tes cours et notes sur cet appareil.",
      };
    }

    return {
      title: "Bienvenue",
      subtitle: "Connecte-toi pour accéder à tes matières, tes cours et ton suivi.",
    };
  }, [mode]);

  const handleChange = (patch) => {
    setValues((currentValues) => ({ ...currentValues, ...patch }));
    setLocalError("");
    onClearError?.();
  };

  const handleSubmit = async () => {
    if (isLoading || submitLockRef.current) {
      return;
    }

    setLocalError("");
    submitLockRef.current = true;

    if (mode === "signup" && values.password !== values.confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas.");
      submitLockRef.current = false;
      return;
    }

    try {
      await onSubmit({
        mode,
        name: values.name,
        email: values.email,
        password: values.password,
      });
    } catch (error) {
      if (!error?.message) {
        setLocalError("Impossible de continuer.");
      }
    } finally {
      submitLockRef.current = false;
    }
  };

  const handleSwitchMode = () => {
    setMode((currentMode) => {
      const nextMode = currentMode === "login" ? "signup" : "login";
      if (nextMode === "signup") {
        setValues({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }

      return nextMode;
    });
    setLocalError("");
    onClearError?.();
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setLocalError("");
    onClearError?.();

    if (nextMode === "signup") {
      setValues({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.backdropTop} />
        <View style={styles.backdropBottom} />

        <AuthBanner title={bannerCopy.title} subtitle={bannerCopy.subtitle} />

        <View style={styles.switchWrap}>
          <AuthModeSwitch
            mode={mode}
            onChangeMode={handleModeChange}
          />
        </View>

        <AuthFormCard
          mode={mode}
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onSwitchMode={handleSwitchMode}
          isLoading={isLoading}
          errorMessage={localError || errorMessage}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  page: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 12,
    backgroundColor: COLORS.bg,
  },
  backdropTop: {
    position: "absolute",
    top: 28,
    right: -90,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(26, 122, 46, 0.08)",
  },
  backdropBottom: {
    position: "absolute",
    bottom: 40,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(224, 112, 32, 0.09)",
  },
  switchWrap: {
    marginTop: 4,
  },
});