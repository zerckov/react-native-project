import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { PerformanceCard } from "../components/PerformanceCard";
import { PendingTasksCard } from "../components/PendingTasksCard";
import { SubjectResultCard } from "../components/SubjectResultCard";
import { RecentCourseCard } from "../components/RecentCourseCard";
import { EmptyState } from "../components/EmptyState";
import { COLORS } from "../theme/colors";

export function HomeScreen({
  userName,
  generalAverage,
  subjects,
  tasks,
  recentCourses,
  onPressRecentCourse,
  onPressAllTasks,
  onPressViewBulletin,
  onScroll,
  onScrollBeginDrag,
}) {
  const subjectCount = subjects.length;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      scrollEventThrottle={16}
    >
      <Text style={styles.caption}>TABLEAU DE BORD</Text>
      <Text style={styles.heroTitle}>Hello,</Text>
      <Text style={styles.heroTitle}>{userName}</Text>

      <PerformanceCard average={generalAverage} onPressViewBulletin={onPressViewBulletin} />
      <PendingTasksCard tasks={tasks} onPressAllTasks={onPressAllTasks} />

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Matières & Résultats</Text>
        <Text style={styles.sectionAction}>{subjectCount} matière{subjectCount > 1 ? "s" : ""}</Text>
      </View>

      {subjects.length ? (
        <View style={styles.subjectPillsRow}>
          {subjects.map((subject) => (
            <View key={subject.id} style={styles.subjectPill}>
              <View style={[styles.subjectPillDot, { backgroundColor: subject.iconColor }]} />
              <Text style={styles.subjectPillText} numberOfLines={1}>
                {subject.name}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState label="Aucune matière enregistrée" />
      )}

      {subjects.map((subject) => (
        <SubjectResultCard key={subject.id} subject={subject} />
      ))}

      <Text style={styles.secondaryTitle}>Cours récents</Text>
      {recentCourses.length ? (
        recentCourses.map((course) => (
          <RecentCourseCard
            key={course.id}
            course={course}
            onPress={() => onPressRecentCourse(course)}
          />
        ))
      ) : (
        <EmptyState label="Aucun cours récemment ouvert" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 14,
    paddingBottom: 110,
  },
  caption: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 54 / 2,
    lineHeight: 56 / 2,
    color: COLORS.text,
    fontWeight: "800",
  },
  sectionRow: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 38 / 2,
    lineHeight: 38 / 2,
    color: COLORS.text,
    fontWeight: "700",
    maxWidth: "62%",
  },
  sectionAction: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
    borderBottomColor: "#9fc1a9",
    borderBottomWidth: 1,
    paddingBottom: 3,
  },
  subjectPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  subjectPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subjectPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subjectPillText: {
    maxWidth: 120,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  secondaryTitle: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 37 / 2,
    color: COLORS.text,
    fontWeight: "700",
  },
});
