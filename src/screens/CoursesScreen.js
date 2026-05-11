import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";
import { EmptyState } from "../components/EmptyState";
import { SubjectAddFormCard } from "../components/SubjectAddFormCard";
import { storeCourseAttachment } from "../data/courseFileStorage";

export function CoursesScreen({
  subjects,
  onAddSubject,
  onAddCourse,
  onDeleteCourse,
  onAddNote,
  onDeleteNote,
  onDeleteSubject,
  onOpenCourse,
  onScroll,
  onScrollBeginDrag,
}) {
  const [name, setName] = useState("");
  const [coef, setCoef] = useState("1");
  const [noteInputs, setNoteInputs] = useState({});
  const [noteLabels, setNoteLabels] = useState({});
  const [noteCoefficients, setNoteCoefficients] = useState({});
  const [uploadingSubjectId, setUploadingSubjectId] = useState(null);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);

  const handleAdd = () => {
    const parsed = Number(coef);
    if (!name.trim() || Number.isNaN(parsed) || parsed <= 0) {
      return;
    }

    onAddSubject(name.trim(), parsed);
    setName("");
    setCoef("1");
    setIsAddFormVisible(false);
  };

  const handleAddCourse = async (subjectId) => {
    try {
      setUploadingSubjectId(subjectId);

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        return;
      }

      const attachment = await storeCourseAttachment(asset, subjectId);
      await onAddCourse(subjectId, attachment);
    } catch (error) {
      console.error("Unable to add course file", error);
    } finally {
      setUploadingSubjectId(null);
    }
  };

  const handleAddNote = (subjectId) => {
    const rawValue = (noteInputs[subjectId] || "").trim();
    const parsedValue = Number(rawValue);
    const label = (noteLabels[subjectId] || "").trim() || "Devoir";
    const rawCoefficient = (noteCoefficients[subjectId] || "").trim();
    const parsedCoefficient = rawCoefficient ? Number(rawCoefficient) : 1;

    if (
      !rawValue ||
      Number.isNaN(parsedValue) ||
      parsedValue < 0 ||
      parsedValue > 20 ||
      Number.isNaN(parsedCoefficient) ||
      parsedCoefficient <= 0
    ) {
      return;
    }

    onAddNote(subjectId, parsedValue, label, parsedCoefficient);
    setNoteInputs((prev) => ({ ...prev, [subjectId]: "" }));
    setNoteLabels((prev) => ({ ...prev, [subjectId]: "" }));
    setNoteCoefficients((prev) => ({ ...prev, [subjectId]: "" }));
  };

  const renderDocumentChip = (course, index, subject) => {
    const title =
      typeof course === "string"
        ? course
        : course.title || course.fileName || "Fichier local";
    const metaLabel =
      typeof course === "string"
        ? "Ancien document"
        : [course.localUri ? "Stocké localement" : "Ancien document", formatFileSize(course.size)]
            .filter(Boolean)
            .join(" • ");

    return (
      <View
        key={`${subject.id}-course-${index}`}
        style={[styles.courseChip, !course.localUri && styles.courseChipDisabled]}
      >
        <Pressable
          style={({ pressed }) => [styles.courseOpenArea, pressed && styles.courseChipPressed]}
          disabled={!course.localUri}
          onPress={() => onOpenCourse(subject, course)}
        >
          <View style={styles.courseIcon}>
            <MaterialCommunityIcons name="file-document-outline" size={14} color={COLORS.primary} />
          </View>
          <View style={styles.courseChipTextWrap}>
            <Text style={styles.courseChipText} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.courseTypeTag} numberOfLines={1}>
              {metaLabel}
            </Text>
          </View>
          <Text style={styles.courseActionText}>{course.localUri ? "Ouvrir" : "Aucun lien"}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.courseDeleteButton,
            pressed && styles.courseDeleteButtonPressed,
          ]}
          disabled={typeof course === "string"}
          onPress={() => onDeleteCourse(subject.id, course)}
          hitSlop={8}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#b42318" />
        </Pressable>
      </View>
    );
  };

  const renderNoteChip = (note, index, subjectId) => (
    <View key={`${subjectId}-note-${index}`} style={styles.noteChip}>
      <View style={styles.noteChipMain}>
        <Text style={styles.noteChipText}>{note.label}</Text>
        <Text style={styles.noteValue}>{Number(note.value).toFixed(1)}</Text>
        <Text style={styles.noteCoefficient}>Coeff {Number(note.coefficient || 1).toFixed(0)}</Text>
      </View>
      <Pressable
        style={styles.deleteIconButton}
        onPress={() => onDeleteNote(subjectId, note.id)}
        hitSlop={8}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={16} color="#b42318" />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Gestion des fichiers et notes</Text>

      {isAddFormVisible ? (
        <View pointerEvents="box-none" style={styles.addFormOverlay}>
          <Pressable style={styles.addFormBackdrop} onPress={() => setIsAddFormVisible(false)} />
          <View style={styles.formCardShell}>
            <SubjectAddFormCard
              name={name}
              coef={coef}
              onChangeName={setName}
              onChangeCoef={setCoef}
              onSubmit={handleAdd}
              onClose={() => setIsAddFormVisible(false)}
            />
          </View>
        </View>
      ) : null}

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={styles.listFooterSpacer} />}
        ListEmptyComponent={<EmptyState label="Aucune matière" />}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.subjectCard}>
            <Pressable
              style={styles.subjectDeleteButton}
              onPress={() => onDeleteSubject(item.id)}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#b42318" />
            </Pressable>
            <View style={styles.subjectHeader}>
              <View style={[styles.subjectIcon, { backgroundColor: item.iconBg }]}> 
                <MaterialCommunityIcons name={item.icon} size={14} color={item.iconColor} />
              </View>
              <View style={styles.subjectMain}>
                <Text style={styles.subjectName}>{item.name}</Text>
                <Text style={styles.subjectMetaLabel}>Coefficient</Text>
                <Text style={styles.subjectMeta}>Coeff {item.coefficient}</Text>
              </View>
              <Text style={styles.subjectGrade}>{item.average.toFixed(1)}</Text>
            </View>

            <Text style={styles.coursesLabel}>Fichiers</Text>
            <View style={styles.chipsWrap}>
              {(item.courses || []).length ? (
                (item.courses || []).map((course, index) =>
                  renderDocumentChip(course, index, item)
                )
              ) : (
                <Text style={styles.emptyCourses}>Aucun cours pour cette matière</Text>
              )}
            </View>

            <View style={styles.uploadSection}>
              <Pressable
                style={styles.uploadButton}
                onPress={() => handleAddCourse(item.id)}
                disabled={uploadingSubjectId === item.id}
              >
                <Text style={styles.uploadButtonText}>
                  {uploadingSubjectId === item.id ? "Importation..." : "Ajouter un cours"}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.coursesLabel}>Notes</Text>
            <View style={styles.chipsWrap}>
              {(item.notes || []).length ? (
                (item.notes || []).map((note, index) => renderNoteChip(note, index, item.id))
              ) : (
                <Text style={styles.emptyCourses}>Aucune note pour cette matière</Text>
              )}
            </View>
            <View style={styles.noteSection}>
              <TextInput
                placeholder="Intitule de la note. ex: 'interrogation'"
                value={noteLabels[item.id] || ""}
                onChangeText={(text) =>
                  setNoteLabels((prev) => ({ ...prev, [item.id]: text }))
                }
                style={[styles.input, styles.noteInput]}
                placeholderTextColor={COLORS.muted}
              />

              <View style={styles.noteRow}>
                <TextInput
                  placeholder="Note /20"
                  value={noteInputs[item.id] || ""}
                  onChangeText={(text) =>
                    setNoteInputs((prev) => ({ ...prev, [item.id]: text }))
                  }
                  style={[styles.input, styles.noteValueInput, styles.noteFieldHalf]}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.muted}
                />

                <TextInput
                  placeholder="Coefficient"
                  value={noteCoefficients[item.id] || ""}
                  onChangeText={(text) =>
                    setNoteCoefficients((prev) => ({ ...prev, [item.id]: text }))
                  }
                  style={[styles.input, styles.noteValueInput, styles.noteFieldHalf]}
                  keyboardType="numeric"
                  inputMode="numeric"
                  placeholderTextColor={COLORS.muted}
                />
              </View>

              <Pressable style={styles.smallButton} onPress={() => handleAddNote(item.id)}>
                <Text style={styles.smallButtonText}>Ajouter note</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <View pointerEvents="box-none" style={styles.fabLayer}>
        <Pressable style={styles.fab} onPress={() => setIsAddFormVisible((value) => !value)}>
          <MaterialCommunityIcons
            name={isAddFormVisible ? "close" : "plus"}
            size={22}
            color="#1f316f"
          />
          <Text style={styles.fabText}>{isAddFormVisible ? "Fermer" : "Ajouter"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatFileSize(size) {
  if (!Number.isFinite(Number(size)) || Number(size) <= 0) {
    return "";
  }

  const normalizedSize = Number(size);
  if (normalizedSize < 1024) {
    return `${normalizedSize} o`;
  }

  const kilobytes = normalizedSize / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(kilobytes < 10 ? 1 : 0)} Ko`;
  }

  return `${(kilobytes / 1024).toFixed(1)} Mo`;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 14,
  },
  title: {
    marginTop: 6,
    fontSize: 26,
    color: COLORS.text,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
  },
  formCardShell: {
    width: "100%",
    maxWidth: 520,
    overflow: "hidden",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
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
  listContent: {
    paddingBottom: 160,
  },
  listFooterSpacer: {
    height: 120,
  },
  subjectCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    paddingTop: 38,
    marginBottom: 8,
    position: "relative",
  },
  subjectDeleteButton: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  subjectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  subjectIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  subjectMain: {
    flex: 1,
  },
  subjectName: {
    color: COLORS.text,
    fontWeight: "600",
  },
  subjectMeta: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 1,
  },
  subjectMetaLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 2,
  },
  subjectGrade: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 16,
  },
  coursesLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  chipsWrap: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 10,
  },
  courseChip: {
    backgroundColor: "#eef5ef",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  courseChipPressed: {
    opacity: 0.75,
  },
  courseChipDisabled: {
    opacity: 0.7,
  },
  courseOpenArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  courseIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#e4efe7",
    alignItems: "center",
    justifyContent: "center",
  },
  courseChipTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  courseChipText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  courseTypeTag: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "500",
    marginTop: 1,
  },
  courseActionText: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  courseDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  courseDeleteButtonPressed: {
    opacity: 0.7,
  },
  noteChip: {
    backgroundColor: "#eef2fb",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  noteChipMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  noteChipText: {
    color: "#3953a4",
    fontSize: 11,
    fontWeight: "600",
    flexShrink: 1,
  },
  noteValue: {
    color: "#1f316f",
    fontSize: 10,
    fontWeight: "700",
    flexShrink: 0,
  },
  noteCoefficient: {
    color: "#5b6fbd",
    fontSize: 10,
    fontWeight: "700",
    flexShrink: 0,
  },
  deleteIconButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCourses: {
    color: COLORS.muted,
    fontSize: 12,
    fontStyle: "italic",
  },
  uploadSection: {
    gap: 7,
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  noteSection: {
    marginTop: 10,
    gap: 8,
  },
  noteRow: {
    flexDirection: "row",
    gap: 8,
  },
  noteInput: {
    marginBottom: 0,
  },
  noteValueInput: {
    marginBottom: 0,
    flex: 1,
    minWidth: 0,
  },
  noteFieldHalf: {
    flexBasis: 0,
  },
  smallButton: {
    marginTop: 2,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  smallButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  fabLayer: {
    position: "absolute",
    right: 14,
    bottom: 70,
    zIndex: 30,
  },
  fab: {
    minWidth: 118,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "white",
    opacity: 0.6,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  fabText: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 13,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  addFormOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    elevation: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  addFormBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(18, 24, 20, 0.42)",
  },
});