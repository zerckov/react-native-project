import * as SQLite from "expo-sqlite";

const AUTH_DATABASE_NAME = "school-app-auth.db";
const DATA_DATABASE_PREFIX = "school-app-data-";
const DEFAULT_AUTH_USER = {
  id: "user-default",
  name: "user",
  email: "user@example.com",
  password: "Password",
  photoUri: null,
};

let authDatabasePromise = null;
let authInitializationPromise = null;
let databasePromises = new Map();
let initializationPromises = new Map();

function normalizeAuthEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function mapAuthUser(userRow) {
  if (!userRow) {
    return null;
  }

  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    createdAt: userRow.createdAt,
    photoUri: userRow.photoUri || null,
  };
}

async function ensureAuthColumns(db) {
  const columns = await db.getAllAsync("PRAGMA table_info(auth_users)");
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has("photoUri")) {
    await db.execAsync("ALTER TABLE auth_users ADD COLUMN photoUri TEXT;");
  }
}

async function ensureUniqueAuthEmails(db) {
  const duplicateEmails = await db.getAllAsync(`
    SELECT LOWER(email) AS normalizedEmail
    FROM auth_users
    GROUP BY LOWER(email)
    HAVING COUNT(*) > 1
  `);

  for (const duplicateEmail of duplicateEmails) {
    const duplicateRows = await db.getAllAsync(
      `
        SELECT rowid, id
        FROM auth_users
        WHERE LOWER(email) = LOWER(?)
        ORDER BY rowid DESC
      `,
      [duplicateEmail.normalizedEmail]
    );

    const [keeper, ...rowsToDelete] = duplicateRows;
    if (!keeper || !rowsToDelete.length) {
      continue;
    }

    for (const row of rowsToDelete) {
      await db.runAsync(
        `
          DELETE FROM auth_users
          WHERE id = ?
        `,
        [row.id]
      );
    }
  }

  await db.execAsync(`
    CREATE UNIQUE INDEX IF NOT EXISTS auth_users_email_nocase_unique
    ON auth_users(email COLLATE NOCASE);
  `);
}

async function seedDefaultAuthUserIfNeeded(db) {
  const userCountRow = await db.getFirstAsync(`
    SELECT COUNT(*) AS count
    FROM auth_users
  `);

  if (Number(userCountRow?.count || 0) > 0) {
    return;
  }

  await db.runAsync(
    `
      INSERT INTO auth_users (id, name, email, password, photoUri, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      DEFAULT_AUTH_USER.id,
      DEFAULT_AUTH_USER.name,
      DEFAULT_AUTH_USER.email,
      DEFAULT_AUTH_USER.password,
      DEFAULT_AUTH_USER.photoUri,
      new Date().toISOString(),
    ]
  );
}

async function getAuthDatabase() {
  if (!authDatabasePromise) {
    authDatabasePromise = SQLite.openDatabaseAsync(AUTH_DATABASE_NAME);
  }

  const db = await authDatabasePromise;
  await db.execAsync("PRAGMA foreign_keys = ON;");
  return db;
}

async function ensureAuthDatabaseSeeded() {
  if (authInitializationPromise) {
    return authInitializationPromise;
  }

  authInitializationPromise = (async () => {
    const db = await getAuthDatabase();

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        photoUri TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS auth_session (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        userId TEXT,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await ensureAuthColumns(db);
    await ensureUniqueAuthEmails(db);
    await seedDefaultAuthUserIfNeeded(db);

    return db;
  })().catch((error) => {
    authInitializationPromise = null;
    throw error;
  });

  return authInitializationPromise;
}

async function setCurrentAuthUser(db, userId) {
  await db.runAsync(
    `
      INSERT OR REPLACE INTO auth_session (id, userId, updatedAt)
      VALUES (1, ?, ?)
    `,
    [userId, new Date().toISOString()]
  );
}

async function getCurrentAuthUserId() {
  const db = await ensureAuthDatabaseSeeded();
  const sessionRow = await db.getFirstAsync(
    `
      SELECT userId
      FROM auth_session
      WHERE id = 1
    `
  );

  return sessionRow?.userId || null;
}

function mapSubjectRow(subjectRow, courseRows) {
  return {
    id: subjectRow.id,
    name: subjectRow.name,
    subtitle: subjectRow.subtitle,
    coefficient: subjectRow.coefficient,
    average: subjectRow.average,
    courses: courseRows.map((courseRow) => ({
      id: courseRow.id,
      title: courseRow.title,
      localUri: courseRow.localUri,
      mimeType: courseRow.mimeType || courseRow.type || null,
      size: courseRow.size != null ? Number(courseRow.size) : null,
    })),
    notes: [],
    progress: subjectRow.progress,
    progressColor: subjectRow.progressColor,
    icon: subjectRow.icon,
    iconBg: subjectRow.iconBg,
    iconColor: subjectRow.iconColor,
  };
}

function mapNoteRow(noteRow) {
  return {
    id: noteRow.id,
    value: noteRow.value,
    label: noteRow.label,
    coefficient: noteRow.coefficient != null ? Number(noteRow.coefficient) : 1,
    createdAt: noteRow.createdAt,
  };
}

function computeAverage(notes, fallbackAverage = 0) {
  if (!notes.length) {
    return fallbackAverage;
  }

  const totalWeighted = notes.reduce(
    (sum, note) => sum + Number(note.value || 0) * Number(note.coefficient || 1),
    0
  );
  const totalCoefficients = notes.reduce(
    (sum, note) => sum + Number(note.coefficient || 1),
    0
  );

  return totalCoefficients ? totalWeighted / totalCoefficients : fallbackAverage;
}

function computeSubjectProgress(notes, average) {
  if (!notes.length) {
    return 0;
  }

  const normalizedAverage = Number(average || 0) / 20;

  return Math.max(0, Math.min(1, normalizedAverage));
}

function buildDefaultSubject(name, coefficient) {
  return {
    id: `sub-${Date.now()}`,
    name,
    subtitle: "Nouveau module",
    coefficient,
    average: 0,
    courses: [],
    notes: [],
    progress: 0,
    progressColor: "#f27328",
    icon: "book-open-page-variant-outline",
    iconBg: "#e8f2eb",
    iconColor: "#2a7a3e",
  };
}

function buildDefaultTask(title, priority) {
  return {
    id: `task-${Date.now()}`,
    title,
    due: "",
    priority: priority?.trim() || "",
    done: false,
  };
}

async function ensureTaskColumns(db) {
  const columns = await db.getAllAsync("PRAGMA table_info(tasks)");
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has("priority")) {
    await db.execAsync("ALTER TABLE tasks ADD COLUMN priority TEXT;");
  }
}

async function ensureNoteColumns(db) {
  const columns = await db.getAllAsync("PRAGMA table_info(subject_notes)");
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has("coefficient")) {
    await db.execAsync("ALTER TABLE subject_notes ADD COLUMN coefficient REAL;");
  }
}

async function ensureCourseColumns(db) {
  const columns = await db.getAllAsync("PRAGMA table_info(courses)");
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has("localUri")) {
    await db.execAsync("ALTER TABLE courses ADD COLUMN localUri TEXT;");
  }

  if (!columnNames.has("mimeType")) {
    await db.execAsync("ALTER TABLE courses ADD COLUMN mimeType TEXT;");
  }

  if (!columnNames.has("size")) {
    await db.execAsync("ALTER TABLE courses ADD COLUMN size REAL;");
  }
}

async function getDatabase() {
  const userId = await getCurrentAuthUserId();
  if (!userId) {
    throw new Error("NO_AUTH_USER");
  }

  const databaseName = `${DATA_DATABASE_PREFIX}${userId}.db`;

  if (!databasePromises.has(databaseName)) {
    databasePromises.set(databaseName, SQLite.openDatabaseAsync(databaseName));
  }

  const db = await databasePromises.get(databaseName);
  await db.execAsync("PRAGMA foreign_keys = ON;");
  return db;
}

async function ensureDatabaseSeeded() {
  const userId = await getCurrentAuthUserId();
  if (!userId) {
    throw new Error("NO_AUTH_USER");
  }

  if (initializationPromises.has(userId)) {
    return initializationPromises.get(userId);
  }

  const initializationPromise = (async () => {
    const db = await getDatabase();

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        coefficient INTEGER NOT NULL,
        average REAL NOT NULL,
        progress REAL NOT NULL,
        progressColor TEXT NOT NULL,
        icon TEXT NOT NULL,
        iconBg TEXT NOT NULL,
        iconColor TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY NOT NULL,
        subjectId TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        localUri TEXT,
        mimeType TEXT,
        size REAL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS subject_notes (
        id TEXT PRIMARY KEY NOT NULL,
        subjectId TEXT NOT NULL,
        value REAL NOT NULL,
        label TEXT NOT NULL,
        coefficient REAL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        due TEXT NOT NULL,
        priority TEXT,
        done INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await ensureCourseColumns(db);
    await ensureTaskColumns(db);
    await ensureNoteColumns(db);

    return db;
  })().catch((error) => {
    initializationPromises.delete(userId);
    throw error;
  });

  initializationPromises.set(userId, initializationPromise);
  return initializationPromise;
}

export async function loadSubjectsFromDatabase() {
  const db = await ensureDatabaseSeeded();
  const subjectRows = await db.getAllAsync(`
    SELECT
      id,
      name,
      subtitle,
      coefficient,
      average,
      progress,
      progressColor,
      icon,
      iconBg,
      iconColor
    FROM subjects
    ORDER BY rowid ASC
  `);
  const noteRows = await db.getAllAsync(`
    SELECT id, subjectId, value, label, coefficient, createdAt
    FROM subject_notes
    ORDER BY rowid ASC
  `);
  const courseRows = await db.getAllAsync(`
    SELECT id, subjectId, title, type, localUri, mimeType, size
    FROM courses
    ORDER BY rowid ASC
  `);

  const notesBySubject = noteRows.reduce((accumulator, noteRow) => {
    if (!accumulator[noteRow.subjectId]) {
      accumulator[noteRow.subjectId] = [];
    }
    accumulator[noteRow.subjectId].push(mapNoteRow(noteRow));
    return accumulator;
  }, {});

  const coursesBySubject = courseRows.reduce((accumulator, courseRow) => {
    if (!accumulator[courseRow.subjectId]) {
      accumulator[courseRow.subjectId] = [];
    }
    accumulator[courseRow.subjectId].push(courseRow);
    return accumulator;
  }, {});

  return subjectRows.map((subjectRow) => {
    const notes = notesBySubject[subjectRow.id] || [];
    const average = notes.length ? computeAverage(notes, subjectRow.average) : subjectRow.average;
    const progress = computeSubjectProgress(notes, average);

    return {
      ...mapSubjectRow(subjectRow, coursesBySubject[subjectRow.id] || []),
      average,
      notes,
      progress,
    };
  });
}

export async function loadAuthState() {
  const db = await ensureAuthDatabaseSeeded();
  const sessionRow = await db.getFirstAsync(
    `
      SELECT userId
      FROM auth_session
      WHERE id = 1
    `
  );

  if (!sessionRow?.userId) {
    return { isAuthenticated: false, user: null };
  }

  const userRow = await db.getFirstAsync(
    `
      SELECT id, name, email, photoUri, createdAt
      FROM auth_users
      WHERE id = ?
    `,
    [sessionRow.userId]
  );

  if (!userRow) {
    await db.runAsync("DELETE FROM auth_session WHERE id = 1");
    return { isAuthenticated: false, user: null };
  }

  return { isAuthenticated: true, user: mapAuthUser(userRow) };
}

export async function registerAccount({ name, email, password }) {
  const db = await ensureAuthDatabaseSeeded();
  const cleanName = String(name || "").trim();
  const cleanEmail = normalizeAuthEmail(email);
  const cleanPassword = String(password || "").trim();

  if (!cleanName || !cleanEmail || !cleanPassword) {
    throw new Error("INVALID_INPUT");
  }

  const existingUser = await db.getFirstAsync(
    `
      SELECT id
      FROM auth_users
      WHERE email = ? COLLATE NOCASE
    `,
    [cleanEmail]
  );

  if (existingUser) {
    throw new Error("ACCOUNT_EXISTS");
  }

  const user = {
    id: `user-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    photoUri: null,
    createdAt: new Date().toISOString(),
  };

  await db.runAsync(
    `
      INSERT INTO auth_users (id, name, email, password, photoUri, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [user.id, user.name, user.email, user.password, user.photoUri, user.createdAt]
  );

  await setCurrentAuthUser(db, user.id);
  return mapAuthUser(user);
}

export async function loginAccount(email, password) {
  const db = await ensureAuthDatabaseSeeded();
  const cleanEmail = normalizeAuthEmail(email);
  const cleanPassword = String(password || "").trim();

  const userRows = await db.getAllAsync(
    `
      SELECT id, name, email, password, photoUri, createdAt
      FROM auth_users
      WHERE email = ? COLLATE NOCASE
      ORDER BY createdAt DESC, rowid DESC
    `,
    [cleanEmail]
  );

  const userRow = userRows.find((row) => row.password === cleanPassword);

  if (!userRow) {
    throw new Error("INVALID_CREDENTIALS");
  }

  await setCurrentAuthUser(db, userRow.id);
  return mapAuthUser(userRow);
}

export async function logoutAccount() {
  const db = await ensureAuthDatabaseSeeded();
  await db.runAsync("DELETE FROM auth_session WHERE id = 1");
}

export async function updateAccountPassword(oldPassword, nextPassword) {
  const db = await ensureAuthDatabaseSeeded();
  const cleanOldPassword = String(oldPassword || "").trim();
  const cleanPassword = String(nextPassword || "").trim();

  if (!cleanOldPassword || !cleanPassword) {
    throw new Error("INVALID_INPUT");
  }

  const userId = await getCurrentAuthUserId();
  if (!userId) {
    throw new Error("NO_AUTH_USER");
  }

  const userRow = await db.getFirstAsync(
    `
      SELECT id, password
      FROM auth_users
      WHERE id = ?
    `,
    [userId]
  );

  if (!userRow || userRow.password !== cleanOldPassword) {
    throw new Error("INVALID_CREDENTIALS");
  }

  await db.runAsync(
    `
      UPDATE auth_users
      SET password = ?
      WHERE id = ?
    `,
    [cleanPassword, userId]
  );
}

export async function updateAccountPhotoUri(photoUri) {
  const db = await ensureAuthDatabaseSeeded();
  const userId = await getCurrentAuthUserId();

  if (!userId) {
    throw new Error("NO_AUTH_USER");
  }

  await db.runAsync(
    `
      UPDATE auth_users
      SET photoUri = ?
      WHERE id = ?
    `,
    [photoUri || null, userId]
  );
}

export async function addSubjectInDatabase(name, coefficient) {
  const db = await ensureDatabaseSeeded();
  const subject = buildDefaultSubject(name, coefficient);

  await db.runAsync(
    `
      INSERT INTO subjects (
        id,
        name,
        subtitle,
        coefficient,
        average,
        progress,
        progressColor,
        icon,
        iconBg,
        iconColor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      subject.id,
      subject.name,
      subject.subtitle,
      subject.coefficient,
      subject.average,
      subject.progress,
      subject.progressColor,
      subject.icon,
      subject.iconBg,
      subject.iconColor,
    ]
  );

  return subject;
}

export async function addCourseInDatabase(subjectId, attachment) {
  const db = await ensureDatabaseSeeded();
  const course = {
    id: `doc-${Date.now()}`,
    title: attachment.title || attachment.fileName || attachment.name || "Fichier local",
    type: attachment.mimeType || attachment.type || "local-file",
    localUri: attachment.localUri || attachment.uri || null,
    mimeType: attachment.mimeType || attachment.type || null,
    size: typeof attachment.size === "number" ? attachment.size : null,
  };

  await db.runAsync(
    `
      INSERT INTO courses (id, subjectId, title, type, localUri, mimeType, size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      course.id,
      subjectId,
      course.title,
      course.type,
      course.localUri,
      course.mimeType,
      course.size,
    ]
  );

  return course;
}

export async function deleteCourseInDatabase(subjectId, courseId) {
  const db = await ensureDatabaseSeeded();
  const course = await db.getFirstAsync(
    `
      SELECT id, subjectId, title, type, localUri, mimeType, size
      FROM courses
      WHERE id = ? AND subjectId = ?
    `,
    [courseId, subjectId]
  );

  if (!course) {
    return null;
  }

  await db.runAsync(
    `
      DELETE FROM courses
      WHERE id = ? AND subjectId = ?
    `,
    [courseId, subjectId]
  );

  return {
    id: course.id,
    subjectId: course.subjectId,
    title: course.title,
    type: course.type,
    localUri: course.localUri,
    mimeType: course.mimeType || course.type || null,
    size: course.size != null ? Number(course.size) : null,
  };
}

export async function addNoteInDatabase(subjectId, noteValue, noteLabel, noteCoefficient) {
  const db = await ensureDatabaseSeeded();
  const note = {
    id: `note-${Date.now()}`,
    value: Number(noteValue),
    label: noteLabel,
    coefficient: Number(noteCoefficient) > 0 ? Number(noteCoefficient) : 1,
    createdAt: new Date().toISOString(),
  };

  await db.runAsync(
    `
      INSERT INTO subject_notes (id, subjectId, value, label, coefficient, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [note.id, subjectId, note.value, note.label, note.coefficient, note.createdAt]
  );

  const noteRows = await db.getAllAsync(
    `
      SELECT value, coefficient
      FROM subject_notes
      WHERE subjectId = ?
      ORDER BY rowid ASC
    `,
    [subjectId]
  );
  const average = computeAverage(noteRows, 0);

  await db.runAsync(
    `
      UPDATE subjects
      SET average = ?
      WHERE id = ?
    `,
    [average, subjectId]
  );

  return note;
}

export async function deleteNoteInDatabase(subjectId, noteId) {
  const db = await ensureDatabaseSeeded();

  await db.runAsync(
    `
      DELETE FROM subject_notes
      WHERE id = ?
    `,
    [noteId]
  );

  const noteRows = await db.getAllAsync(
    `
      SELECT value, coefficient
      FROM subject_notes
      WHERE subjectId = ?
      ORDER BY rowid ASC
    `,
    [subjectId]
  );
  const average = computeAverage(noteRows, 0);

  await db.runAsync(
    `
      UPDATE subjects
      SET average = ?
      WHERE id = ?
    `,
    [average, subjectId]
  );
}

export async function deleteSubjectInDatabase(subjectId) {
  const db = await ensureDatabaseSeeded();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `
        DELETE FROM subject_notes
        WHERE subjectId = ?
      `,
      [subjectId]
    );

    await db.runAsync(
      `
        DELETE FROM courses
        WHERE subjectId = ?
      `,
      [subjectId]
    );

    await db.runAsync(
      `
        DELETE FROM subjects
        WHERE id = ?
      `,
      [subjectId]
    );
  });
}

export async function loadTasksFromDatabase() {
  const db = await ensureDatabaseSeeded();
  const taskRows = await db.getAllAsync(`
    SELECT id, title, due, priority, done, createdAt
    FROM tasks
    ORDER BY rowid ASC
  `);

  return taskRows.map((taskRow) => ({
    id: taskRow.id,
    title: taskRow.title,
    priority: taskRow.priority || "",
    done: Boolean(taskRow.done),
    createdAt: taskRow.createdAt,
  }));
}

export async function addTaskInDatabase(title, priority) {
  const db = await ensureDatabaseSeeded();
  const task = buildDefaultTask(title, priority);

  await db.runAsync(
    `
      INSERT INTO tasks (id, title, due, priority, done, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [task.id, task.title, task.due, task.priority, task.done ? 1 : 0, new Date().toISOString()]
  );

  return task;
}

export async function toggleTaskInDatabase(taskId) {
  const db = await ensureDatabaseSeeded();
  await db.runAsync(
    `
      UPDATE tasks
      SET done = CASE done WHEN 1 THEN 0 ELSE 1 END
      WHERE id = ?
    `,
    [taskId]
  );
}

export async function deleteTaskInDatabase(taskId) {
  const db = await ensureDatabaseSeeded();
  await db.runAsync(
    `
      DELETE FROM tasks
      WHERE id = ?
    `,
    [taskId]
  );
}