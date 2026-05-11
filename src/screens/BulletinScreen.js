import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export function BulletinScreen({ generalAverage, subjects, onScroll, onScrollBeginDrag }) {
  return (
    <ScrollView
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      scrollEventThrottle={16}
    >
      <Text style={styles.kicker}>RAPPORT COMPLET</Text>
      <Text style={styles.title}>Bulletin</Text>
      <Text style={styles.subtitle}>
        Vue complète de la moyenne générale, des matières et des notes.
      </Text>

      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <MaterialCommunityIcons name="school-outline" size={18} color={COLORS.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>Moyenne générale</Text>
          <Text style={styles.heroValue}>{generalAverage.toFixed(1)} / 20</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Matières</Text>
      {subjects.length ? (
        subjects.map((subject) => (
          <View key={subject.id} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <View style={[styles.subjectDot, { backgroundColor: subject.iconColor }]} />
              <View style={styles.subjectMeta}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectInfo}>Coefficient {subject.coefficient}</Text>
              </View>
              <Text style={styles.subjectAverage}>{subject.average.toFixed(1)}</Text>
            </View>

            <Text style={styles.notesLabel}>Notes</Text>
            {subject.notes?.length ? (
              <View style={styles.notesWrap}>
                {subject.notes.map((note) => (
                  <View key={note.id} style={styles.noteRow}>
                    <View style={styles.noteMain}>
                      <Text style={styles.noteTitle}>{note.label}</Text>
                      <Text style={styles.noteMeta}>Coeff {Number(note.coefficient || 1).toFixed(0)}</Text>
                    </View>
                    <Text style={styles.noteValue}>{Number(note.value).toFixed(1)}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Aucune note enregistrée</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Aucune matière enregistrée</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 14,
    paddingBottom: 110,
  },
  kicker: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    letterSpacing: 1.1,
    fontWeight: "700",
  },
  title: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    color: COLORS.muted,
    lineHeight: 19,
  },
  heroCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    flex: 1,
  },
  heroLabel: {
    color: "#d7ebd8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroValue: {
    marginTop: 4,
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 10,
  },
  subjectCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subjectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  subjectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  subjectMeta: {
    flex: 1,
  },
  subjectName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  subjectInfo: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 12,
  },
  subjectAverage: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  notesLabel: {
    marginTop: 14,
    marginBottom: 8,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notesWrap: {
    gap: 8,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#fbfcfb",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteMain: {
    flex: 1,
    paddingRight: 10,
  },
  noteTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  noteMeta: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 11,
  },
  noteValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    color: COLORS.muted,
    fontStyle: "italic",
  },
});