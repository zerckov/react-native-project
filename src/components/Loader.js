import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

export function Loader({ variant = "app" }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.32, 0.8],
  });

  const skeletonTone = useMemo(
    () => ({ opacity }),
    [opacity]
  );

  if (variant === "home") {
    return <HomeSkeleton tone={skeletonTone} />;
  }

  if (variant === "courses") {
    return <CoursesSkeleton tone={skeletonTone} />;
  }

  if (variant === "tasks") {
    return <TasksSkeleton tone={skeletonTone} />;
  }

  if (variant === "profile") {
    return <ProfileSkeleton tone={skeletonTone} />;
  }

  return <AppSkeleton tone={skeletonTone} />;
}

export default Loader;

function SkeletonBlock({ tone, style }) {
  return <Animated.View style={[styles.block, tone, style]} />;
}

function AppSkeleton({ tone }) {
  return (
    <View style={styles.screen}>
      <View style={styles.appCard}>
        <SkeletonBlock tone={tone} style={styles.appTitle} />
        <SkeletonBlock tone={tone} style={styles.appSubtitle} />
        <View style={styles.appIconRow}>
          <SkeletonBlock tone={tone} style={styles.appIcon} />
          <SkeletonBlock tone={tone} style={styles.appIcon} />
          <SkeletonBlock tone={tone} style={styles.appIcon} />
        </View>
        <SkeletonBlock tone={tone} style={styles.appLine} />
        <SkeletonBlock tone={tone} style={styles.appLine} />
      </View>
    </View>
  );
}

function HomeSkeleton({ tone }) {
  return (
    <View style={styles.page}>
      <SkeletonBlock tone={tone} style={styles.heroCaption} />
      <SkeletonBlock tone={tone} style={styles.heroTitleShort} />
      <SkeletonBlock tone={tone} style={styles.heroTitleLong} />
      <SkeletonBlock tone={tone} style={styles.summaryCard} />
      <SkeletonBlock tone={tone} style={styles.summaryCard} />
      <View style={styles.sectionHeader}>
        <SkeletonBlock tone={tone} style={styles.sectionHeaderLeft} />
        <SkeletonBlock tone={tone} style={styles.sectionHeaderRight} />
      </View>
      <View style={styles.pillRow}>
        <SkeletonBlock tone={tone} style={styles.pill} />
        <SkeletonBlock tone={tone} style={styles.pill} />
        <SkeletonBlock tone={tone} style={styles.pill} />
      </View>
      <SkeletonBlock tone={tone} style={styles.cardRow} />
      <SkeletonBlock tone={tone} style={styles.cardRow} />
      <SkeletonBlock tone={tone} style={styles.cardRow} />
    </View>
  );
}

function CoursesSkeleton({ tone }) {
  return (
    <View style={styles.page}>
      <SkeletonBlock tone={tone} style={styles.pageTitle} />
      <SkeletonBlock tone={tone} style={styles.formCard} />
      <SkeletonBlock tone={tone} style={styles.formCard} />
      <SkeletonBlock tone={tone} style={styles.formCard} />
      <SkeletonBlock tone={tone} style={styles.listCard} />
      <SkeletonBlock tone={tone} style={styles.listCard} />
      <SkeletonBlock tone={tone} style={styles.listCard} />
    </View>
  );
}

function TasksSkeleton({ tone }) {
  return (
    <View style={styles.page}>
      <SkeletonBlock tone={tone} style={styles.pageTitle} />
      <SkeletonBlock tone={tone} style={styles.inputRow} />
      <View style={styles.chipRow}>
        <SkeletonBlock tone={tone} style={styles.chip} />
        <SkeletonBlock tone={tone} style={styles.chip} />
        <SkeletonBlock tone={tone} style={styles.chip} />
      </View>
      <SkeletonBlock tone={tone} style={styles.listCard} />
      <SkeletonBlock tone={tone} style={styles.listCard} />
      <SkeletonBlock tone={tone} style={styles.listCard} />
      <SkeletonBlock tone={tone} style={styles.listCard} />
    </View>
  );
}

function ProfileSkeleton({ tone }) {
  return (
    <View style={styles.page}>
      <SkeletonBlock tone={tone} style={styles.pageTitle} />
      <View style={styles.profileHeader}>
        <SkeletonBlock tone={tone} style={styles.avatar} />
        <SkeletonBlock tone={tone} style={styles.profileButton} />
      </View>
      <SkeletonBlock tone={tone} style={styles.label} />
      <SkeletonBlock tone={tone} style={styles.inputRow} />
      <SkeletonBlock tone={tone} style={styles.profileButtonWide} />
      <SkeletonBlock tone={tone} style={styles.inputRow} />
      <SkeletonBlock tone={tone} style={styles.inputRow} />
      <View style={styles.statsRow}>
        <SkeletonBlock tone={tone} style={styles.statCard} />
        <SkeletonBlock tone={tone} style={styles.statCard} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f2f2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  appCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    paddingVertical: 30,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ececec",
  },
  appTitle: {
    width: "62%",
    height: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  appSubtitle: {
    width: "44%",
    height: 14,
    borderRadius: 10,
    marginBottom: 26,
  },
  appIconRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  appLine: {
    width: "100%",
    height: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  page: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 110,
    backgroundColor: "#f3f2f2",
  },
  heroCaption: {
    width: 110,
    height: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  heroTitleShort: {
    width: 96,
    height: 26,
    borderRadius: 14,
    marginBottom: 8,
  },
  heroTitleLong: {
    width: 150,
    height: 26,
    borderRadius: 14,
    marginBottom: 14,
  },
  summaryCard: {
    width: "100%",
    height: 100,
    borderRadius: 18,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    width: 150,
    height: 18,
    borderRadius: 10,
  },
  sectionHeaderRight: {
    width: 72,
    height: 12,
    borderRadius: 8,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    width: 88,
    height: 30,
    borderRadius: 999,
  },
  cardRow: {
    width: "100%",
    height: 82,
    borderRadius: 18,
    marginBottom: 12,
  },
  pageTitle: {
    width: 130,
    height: 26,
    borderRadius: 14,
    marginBottom: 14,
  },
  formCard: {
    width: "100%",
    height: 98,
    borderRadius: 18,
    marginBottom: 12,
  },
  listCard: {
    width: "100%",
    height: 76,
    borderRadius: 16,
    marginBottom: 12,
  },
  inputRow: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    width: 84,
    height: 32,
    borderRadius: 999,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  profileButton: {
    width: 118,
    height: 34,
    borderRadius: 12,
  },
  profileButtonWide: {
    width: "70%",
    height: 42,
    borderRadius: 14,
    marginBottom: 14,
  },
  label: {
    width: 110,
    height: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    height: 88,
    borderRadius: 18,
  },
  block: {
    backgroundColor: "#dde2de",
  },
});