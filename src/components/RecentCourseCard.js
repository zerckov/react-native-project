import React from "react";
import { ImageBackground, Pressable, View, Text, StyleSheet } from "react-native";

export function RecentCourseCard({ course, onPress }) {
  const CardContainer = onPress ? Pressable : View;
  const containerProps = onPress
    ? { onPress, style: ({ pressed }) => [styles.card, pressed && styles.cardPressed] }
    : { style: styles.card };

  if (!course.image) {
    return (
      <CardContainer {...containerProps}>
        <View style={[styles.fallbackCard, onPress && styles.fallbackCardInteractive]}>
        <View style={styles.fallbackBadge}>
          <Text style={styles.fallbackBadgeText}>Cours ouvert</Text>
        </View>
        <Text style={styles.fallbackCategory}>{course.category}</Text>
        <Text style={styles.fallbackTitle}>{course.title}</Text>
        <Text style={styles.fallbackSubtitle}>{course.subtitle}</Text>
        </View>
      </CardContainer>
    );
  }

  return (
    <CardContainer {...containerProps}>
      <ImageBackground source={{ uri: course.image }} style={styles.card} imageStyle={styles.image}>
      <View style={styles.overlay}>
        <Text style={styles.category}>{course.category}</Text>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.subtitle}>{course.subtitle}</Text>
      </View>
      </ImageBackground>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 140,
    marginBottom: 12,
    justifyContent: "flex-end",
  },
  cardPressed: {
    opacity: 0.85,
  },
  fallbackCard: {
    borderRadius: 18,
    backgroundColor: "#eaf3ea",
    padding: 14,
    height: 140,
    justifyContent: "flex-end",
  },
  fallbackCardInteractive: {
    overflow: "hidden",
  },
  fallbackBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#d7e8d8",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  fallbackBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2a7a3e",
  },
  fallbackCategory: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2a7a3e",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  fallbackTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    color: "#1f2f23",
  },
  fallbackSubtitle: {
    marginTop: 5,
    color: "#3f5746",
    fontSize: 12,
  },
  image: {
    borderRadius: 18,
  },
  overlay: {
    borderRadius: 18,
    backgroundColor: "rgba(9, 14, 10, 0.56)",
    padding: 14,
    height: "100%",
    justifyContent: "flex-end",
  },
  category: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(242, 245, 241, 0.86)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: "700",
    color: "#213628",
    marginBottom: 8,
  },
  title: {
    fontSize: 33 / 2,
    color: "#ffffff",
    fontWeight: "700",
    lineHeight: 22,
  },
  subtitle: {
    marginTop: 5,
    color: "#d7e2d8",
    fontSize: 12,
  },
});
