import React from "react";
import { Image, View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../theme/colors";

export function AppHeader({ onPressProfile, avatarUri, avatarLabel }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EduManager</Text>

      <Pressable style={styles.avatarShell} onPress={onPressProfile}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarCore}>
            <Text style={styles.avatarText}>{avatarLabel || "CM"}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.bg,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  avatarShell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 34,
    height: 34,
  },
  avatarCore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ffd9bf",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "bold",
  },
});
