import React, { useEffect, useMemo, useRef, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "./src/components/AppHeader";
import { BottomNav } from "./src/components/BottomNav";
import {
  addCourseInDatabase,
  addNoteInDatabase,
  addSubjectInDatabase,
  deleteCourseInDatabase,
  deleteNoteInDatabase,
  deleteSubjectInDatabase,
  addTaskInDatabase,
  deleteTaskInDatabase,
  loadSubjectsFromDatabase,
  loadTasksFromDatabase,
  toggleTaskInDatabase,
} from "./src/data/appDatabase";
import { deleteCourseAttachment, openCourseAttachment } from "./src/data/courseFileStorage";
import { storeProfilePhoto } from "./src/data/profilePhotoStorage";
import {
  loadAuthState,
  loginAccount,
  logoutAccount,
  registerAccount,
  updateAccountPassword,
  updateAccountPhotoUri,
} from "./src/data/authStorage";
import { AuthScreen } from "./src/screens/AuthScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { BulletinScreen } from "./src/screens/BulletinScreen";
import { CoursesScreen } from "./src/screens/CoursesScreen";
import { TasksScreen } from "./src/screens/TasksScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { Loader } from "./src/components/Loader";
import { COLORS } from "./src/theme/colors";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [profile, setProfile] = useState({
    name: "Clement",
    password: "",
    photoLabel: "CM",
    photoUri: null,
  });
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const scrollOffsetRef = useRef(0);

  const refreshSubjects = async () => {
    const loadedSubjects = await loadSubjectsFromDatabase();
    setSubjects(loadedSubjects);
  };

  const refreshTasks = async () => {
    const loadedTasks = await loadTasksFromDatabase();
    setTasks(loadedTasks);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadAuth() {
      try {
        const state = await loadAuthState();
        if (!isMounted) {
          return;
        }

        setAuthUser(state.user);
        if (state.user) {
          setProfile({
            name: state.user.name,
            password: "",
            photoLabel: getProfilePhotoLabel(state.user.name),
            photoUri: state.user.photoUri || null,
          });
        }
      } catch (error) {
        console.error("Unable to load auth state", error);
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    }

    loadAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    let isMounted = true;

    async function loadWorkspace() {
      if (!authUser) {
        setSubjects([]);
        setTasks([]);
        setRecentCourses([]);
        setIsLoadingSubjects(false);
        return;
      }

      try {
        setIsLoadingSubjects(true);
        await refreshSubjects();
        await refreshTasks();
      } catch (error) {
        console.error("Unable to load subjects from SQLite", error);
      } finally {
        if (isMounted) {
          setIsLoadingSubjects(false);
        }
      }
    }

    loadWorkspace();

    return () => {
      isMounted = false;
    };
  }, [authUser, isAuthReady]);

  useEffect(() => {
    setIsBottomNavVisible(true);
    scrollOffsetRef.current = 0;
  }, [activeTab]);

  const generalAverage = useMemo(() => {
    const gradedSubjects = subjects.filter((subject) => (subject.notes || []).length > 0);

    if (!gradedSubjects.length) {
      return 0;
    }
    const weighted = gradedSubjects.reduce(
      (sum, item) => sum + item.average * item.coefficient,
      0
    );
    const coeff = gradedSubjects.reduce((sum, item) => sum + item.coefficient, 0);
    return coeff ? weighted / coeff : 0;
  }, [subjects]);

  const addSubject = async (name, coefficient) => {
    try {
      await addSubjectInDatabase(name, coefficient);
      await refreshSubjects();
    } catch (error) {
      console.error("Unable to add subject", error);
    }
  };

  const normalizeAuthError = (error) => {
    if (error?.message === "ACCOUNT_EXISTS") {
      return "Ce compte existe deja.";
    }

    if (error?.message === "INVALID_CREDENTIALS") {
      return "Email ou mot de passe incorrect.";
    }

    if (error?.message === "INVALID_INPUT") {
      return "Renseigne tous les champs requis.";
    }

    return "Impossible de continuer.";
  };

  const handleAuthSubmit = async ({ mode, name, email, password }) => {
    setAuthError("");
    setIsAuthSubmitting(true);

    try {
      const user =
        mode === "signup"
          ? await registerAccount({ name, email, password })
          : await loginAccount(email, password);

      setAuthUser(user);
      setProfile({
        name: user.name,
        password: "",
        photoLabel: getProfilePhotoLabel(user.name),
        photoUri: user.photoUri || null,
      });
      setActiveTab("home");
    } catch (error) {
      const message = normalizeAuthError(error);
      setAuthError(message);
      throw error;
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const clearAuthError = () => {
    setAuthError("");
  };

  const handleLogout = async () => {
    await logoutAccount();
    setAuthUser(null);
    setSubjects([]);
    setTasks([]);
    setRecentCourses([]);
    setProfile({ name: "Clement", password: "", photoLabel: "CM", photoUri: null });
    setActiveTab("home");
    setIsBottomNavVisible(true);
  };

  const handlePickProfilePhoto = async () => {
    if (!authUser?.id) {
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
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

    const storedPhoto = await storeProfilePhoto(asset, authUser.id);
    await updateAccountPhotoUri(storedPhoto.localUri);

    setProfile((currentProfile) => ({
      ...currentProfile,
      photoUri: storedPhoto.localUri,
    }));
  };

  const handlePasswordUpdate = async ({ oldPassword, nextPassword }) => {
    const cleanPassword = String(nextPassword || "").trim();
    const cleanOldPassword = String(oldPassword || "").trim();

    if (!cleanOldPassword || !cleanPassword) {
      throw new Error("INVALID_INPUT");
    }

    if (!cleanPassword) {
      return;
    }

    await updateAccountPassword(cleanOldPassword, cleanPassword);
    setProfile((currentProfile) => ({ ...currentProfile, password: "" }));
  };

  const addCourseToSubject = async (subjectId, attachment) => {
    try {
      await addCourseInDatabase(subjectId, attachment);
      await refreshSubjects();
    } catch (error) {
      console.error("Unable to add course", error);
    }
  };

  const deleteCourseFromSubject = async (subjectId, course) => {
    try {
      if (course?.localUri) {
        await deleteCourseAttachment(course.localUri);
      }

      await deleteCourseInDatabase(subjectId, course.id);

      const courseIdentifier = getCourseIdentifier(course);
      setRecentCourses((currentCourses) =>
        currentCourses.filter((item) => item.sourceId !== courseIdentifier)
      );

      await refreshSubjects();
    } catch (error) {
      console.error("Unable to delete course", error);
    }
  };

  const addNoteToSubject = async (subjectId, noteValue, noteLabel, noteCoefficient) => {
    try {
      await addNoteInDatabase(subjectId, noteValue, noteLabel, noteCoefficient);
      await refreshSubjects();
    } catch (error) {
      console.error("Unable to add note", error);
    }
  };

  const deleteNoteFromSubject = async (subjectId, noteId) => {
    try {
      await deleteNoteInDatabase(subjectId, noteId);
      await refreshSubjects();
    } catch (error) {
      console.error("Unable to delete note", error);
    }
  };

  const deleteSubject = async (subjectId) => {
    try {
      await deleteSubjectInDatabase(subjectId);
      await refreshSubjects();
    } catch (error) {
      console.error("Unable to delete subject", error);
    }
  };

  const addTask = (title, priority) => {
    addTaskInDatabase(title, priority)
      .then(refreshTasks)
      .catch((error) => console.error("Unable to add task", error));
  };

  const toggleTask = (taskId) => {
    toggleTaskInDatabase(taskId)
      .then(refreshTasks)
      .catch((error) => console.error("Unable to toggle task", error));
  };

  const deleteTask = (taskId) => {
    deleteTaskInDatabase(taskId)
      .then(refreshTasks)
      .catch((error) => console.error("Unable to delete task", error));
  };

  const registerRecentCourse = (subject, course) => {
    const nowLabel = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setRecentCourses((currentCourses) => {
      const identifier = getCourseIdentifier(course);
      const nextCourse = {
        id: identifier,
        sourceId: identifier,
        category: subject?.name || "Cours",
        title: course.title || "Cours ouvert",
        subtitle: `Ouvert à ${nowLabel}`,
        image: null,
        localUri: course.localUri || null,
        mimeType: course.mimeType || null,
        subjectName: subject?.name || "Cours",
      };

      const filteredCourses = currentCourses.filter((item) => item.sourceId !== identifier);
      return [nextCourse, ...filteredCourses].slice(0, 5);
    });
  };

  const getCourseIdentifier = (course) => course?.id || course?.localUri || course?.title;

  const handleOpenCourse = async (subject, course) => {
    if (!course?.localUri) {
      return;
    }

    const opened = await openCourseAttachment(course.localUri, course.mimeType);
    if (opened) {
      registerRecentCourse(subject, course);
    }
  };

  const handleOpenRecentCourse = async (course) => {
    if (!course?.localUri) {
      return;
    }

    const opened = await openCourseAttachment(course.localUri, course.mimeType);
    if (opened) {
      setRecentCourses((currentCourses) => {
        const filteredCourses = currentCourses.filter((item) => item.sourceId !== course.sourceId);
        return [course, ...filteredCourses].slice(0, 5);
      });
    }
  };

  const handleContentScroll = (event) => {
    const nextOffset = event?.nativeEvent?.contentOffset?.y ?? 0;
    const delta = nextOffset - scrollOffsetRef.current;

    if (nextOffset <= 0) {
      setIsBottomNavVisible(true);
    } else if (delta > 8) {
      setIsBottomNavVisible(false);
    } else if (delta < -8) {
      setIsBottomNavVisible(true);
    }

    scrollOffsetRef.current = nextOffset;
  };

  const handleScrollBeginDrag = () => {
    scrollOffsetRef.current = 0;
  };

  const isWorkspaceLoading = authUser && isLoadingSubjects && !subjects.length;

  if (!isAuthReady) {
    return <Loader />;
  }

  if (!authUser) {
    return (
      <View style={styles.safeArea}>
        <AuthScreen
          onSubmit={handleAuthSubmit}
          isLoading={isAuthSubmitting}
          errorMessage={authError}
          onClearError={clearAuthError}
        />
      </View>
    );
  }

  if (isWorkspaceLoading) {
    return <Loader variant={activeTab} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <AppHeader
        onPressProfile={() => setActiveTab("profile")}
        avatarUri={profile.photoUri}
        avatarLabel={profile.photoLabel}
      />

      <View style={styles.content}>
        {isLoadingSubjects && !subjects.length ? (
          <Text style={styles.loadingText}>Chargement des cours...</Text>
        ) : null}

        {activeTab === "home" ? (
          <HomeScreen
            userName={profile.name}
            generalAverage={generalAverage}
            subjects={subjects}
            tasks={tasks}
            recentCourses={recentCourses}
            onPressRecentCourse={handleOpenRecentCourse}
            onPressAllTasks={() => setActiveTab("tasks")}
            onPressViewBulletin={() => setActiveTab("bulletin")}
            onScroll={handleContentScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
          />
        ) : null}

        {activeTab === "bulletin" ? (
          <BulletinScreen
            generalAverage={generalAverage}
            subjects={subjects}
            onScroll={handleContentScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
          />
        ) : null}

        {activeTab === "courses" ? (
          <CoursesScreen
            subjects={subjects}
            onAddSubject={addSubject}
            onAddCourse={addCourseToSubject}
            onDeleteCourse={deleteCourseFromSubject}
            onAddNote={addNoteToSubject}
            onDeleteNote={deleteNoteFromSubject}
            onDeleteSubject={deleteSubject}
            onOpenCourse={handleOpenCourse}
            onScroll={handleContentScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
          />
        ) : null}

        {activeTab === "tasks" ? (
          <TasksScreen
            tasks={tasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onScroll={handleContentScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
          />
        ) : null}

        {activeTab === "profile" ? (
          <ProfileScreen
            profile={profile}
            onPickProfilePhoto={handlePickProfilePhoto}
            onUpdatePassword={handlePasswordUpdate}
            stats={{ subjects: subjects.length, average: generalAverage }}
            onLogout={handleLogout}
            onScroll={handleContentScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
          />
        ) : null}
      </View>

      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        visible={isBottomNavVisible}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
  },
});

function getProfilePhotoLabel(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "CM";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

