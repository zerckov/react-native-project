import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

const iconByTab = {
  home: (active) => (
    <Ionicons
      name={active ? "home" : "home-outline"}
      size={16}
      color={active ? "#ffffff" : "#5f5f5f"}
    />
  ),
  courses: (active) => (
    <MaterialCommunityIcons
      name={active ? "school" : "school-outline"}
      size={16}
      color={active ? "#ffffff" : "#5f5f5f"}
    />
  ),
  tasks: (active) => (
    <Ionicons
      name={active ? "checkmark-circle" : "checkmark-circle-outline"}
      size={16}
      color={active ? "#ffffff" : "#5f5f5f"}
    />
  ),
  profile: (active) => (
    <Ionicons
      name={active ? "person" : "person-outline"}
      size={16}
      color={active ? "#ffffff" : "#5f5f5f"}
    />
  ),
  bulletin: (active) => (
    <MaterialCommunityIcons
      name={active ? "chart-box" : "chart-box-outline"}
      size={16}
      color={active ? "#ffffff" : "#5f5f5f"}
    />
  ),
};

export function BottomNav({ activeTab, onChangeTab, visible = true }) {
  const animation = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [visible, animation]);

  const tabs = [
    { key: "home", label: "Accueil" },
    { key: "bulletin", label: "Bulletin" },
    { key: "courses", label: "Cours" },
    { key: "tasks", label: "Tâches" },
    { key: "profile", label: "Profil" },
  ];

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.wrapper,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [86, 0],
              }),
            },
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1],
              }),
            },
          ],
        },
      ]}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            style={styles.item}
            onPress={() => onChangeTab(tab.key)}
          >
            <View style={[styles.iconBubble, active && styles.iconBubbleActive]}>
              {iconByTab[tab.key](active)}
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    borderRadius: 20,
    backgroundColor: "#fdfdfd",
    paddingVertical: 8,
    paddingHorizontal: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  iconBubble: {
    width: 28,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconBubbleActive: {
    backgroundColor: COLORS.accent,
  },
  label: {
    fontSize: 9,
    color: "#4f4f4f",
    fontWeight: "500",
  },
  labelActive: {
    color: COLORS.accent,
    fontWeight: "700",
  },
});
