import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('fitness.db');

const RETENTION_DAYS = 7;

// Converts a Date object into 'YYYY-MM-DD' using local time (not UTC),
// so "today" always matches what the device clock actually shows.
function toISO(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Returns today's date as 'YYYY-MM-DD'.
export function todayISO() {
  return toISO(new Date());
}

// Returns the date N days before today, as 'YYYY-MM-DD'.
function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
}

// Turns a stored 'YYYY-MM-DD' into a friendly label: Today, Yesterday, or a real date.
export function formatRelativeDate(isoDate) {
  if (isoDate === todayISO()) return 'Today';
  if (isoDate === daysAgoISO(1)) return 'Yesterday';

  const [year, month, day] = isoDate.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      duration_min INTEGER,
      notes TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      calories INTEGER,
      protein_g INTEGER
    );
  `);

  // Safe migration: adds notes column to meals if this table predates it.
  try { db.execSync("ALTER TABLE meals ADD COLUMN notes TEXT;"); } catch (e) {}

  db.execSync(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      weight_kg REAL,
      height_cm REAL
    );
  `);

  // Safe migration: adds new columns if this table was created before they existed.
  // SQLite has no "ADD COLUMN IF NOT EXISTS", so we just try and ignore the error
  // if the column is already there.
  try { db.execSync("ALTER TABLE profile ADD COLUMN sex TEXT;"); } catch (e) {}
  try { db.execSync("ALTER TABLE profile ADD COLUMN units TEXT DEFAULT 'metric';"); } catch (e) {}
}

export function getProfile() {
  const row = db.getFirstSync('SELECT * FROM profile WHERE id = 1;');
  return row || { weight_kg: null, height_cm: null, sex: null, units: 'metric' };
}

export function setProfile(weightKg, heightCm, sex, units) {
  db.runSync(
    `INSERT INTO profile (id, weight_kg, height_cm, sex, units) VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       weight_kg = excluded.weight_kg,
       height_cm = excluded.height_cm,
       sex = excluded.sex,
       units = excluded.units;`,
    [weightKg, heightCm, sex, units]
  );
}

// Deletes all workout history only. Meals and profile settings are untouched.
export function clearAllWorkouts() {
  db.runSync('DELETE FROM workouts;');
}

// Deletes all meal history only. Workouts and profile settings are untouched.
export function clearAllMeals() {
  db.runSync('DELETE FROM meals;');
}

// Deletes any workout or meal older than RETENTION_DAYS. Since dates are
// stored as 'YYYY-MM-DD' strings, plain string comparison works correctly
// for chronological ordering (ISO format sorts lexicographically = date order).
// Call this once per app launch, before reading any data.
export function pruneOldData() {
  const cutoff = daysAgoISO(RETENTION_DAYS - 1); // keep today + previous 6 days = 7 days total
  db.runSync('DELETE FROM workouts WHERE date < ?;', [cutoff]);
  db.runSync('DELETE FROM meals WHERE date < ?;', [cutoff]);
}

export function seedIfEmpty() {
  const workoutCount = db.getFirstSync('SELECT COUNT(*) as count FROM workouts');
  if (workoutCount.count === 0) {
    db.runSync(
      'INSERT INTO workouts (name, date, duration_min, notes) VALUES (?, ?, ?, NULL);',
      ['Upper Body Strength', todayISO(), 45]
    );
    db.runSync(
      'INSERT INTO workouts (name, date, duration_min, notes) VALUES (?, ?, ?, NULL);',
      ['5k Run', daysAgoISO(1), 28]
    );
    db.runSync(
      'INSERT INTO workouts (name, date, duration_min, notes) VALUES (?, ?, ?, NULL);',
      ['Leg Day', daysAgoISO(2), 52]
    );
  }

  const mealCount = db.getFirstSync('SELECT COUNT(*) as count FROM meals');
  if (mealCount.count === 0) {
    db.runSync(
      'INSERT INTO meals (name, date, time, calories, protein_g) VALUES (?, ?, ?, ?, ?);',
      ['Chicken & Rice Bowl', todayISO(), '1:30 PM', 620, 45]
    );
    db.runSync(
      'INSERT INTO meals (name, date, time, calories, protein_g) VALUES (?, ?, ?, ?, ?);',
      ['Protein Shake', todayISO(), '9:00 AM', 240, 30]
    );
  }
}

export function getRecentWorkouts(limit = 5) {
  return db.getAllSync('SELECT * FROM workouts ORDER BY id DESC LIMIT ?;', [limit]);
}

export function getWorkoutById(id) {
  return db.getFirstSync('SELECT * FROM workouts WHERE id = ?;', [id]);
}

export function updateWorkoutNotes(id, notes) {
  db.runSync('UPDATE workouts SET notes = ? WHERE id = ?;', [notes, id]);
}

export function getRecentMeals(limit = 5) {
  return db.getAllSync('SELECT * FROM meals ORDER BY id DESC LIMIT ?;', [limit]);
}

export function getMealById(id) {
  return db.getFirstSync('SELECT * FROM meals WHERE id = ?;', [id]);
}

export function updateMealNotes(id, notes) {
  db.runSync('UPDATE meals SET notes = ? WHERE id = ?;', [notes, id]);
}

// Only counts meals logged with today's real date — this is what makes the
// dashboard totals naturally reset at midnight, since "today" itself changes.
export function getTodayStats() {
  const today = todayISO();
  const meals = db.getAllSync('SELECT * FROM meals WHERE date = ?;', [today]);
  const caloriesConsumed = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const proteinG = meals.reduce((sum, m) => sum + (m.protein_g || 0), 0);

  return {
    steps: 8432, // placeholder until HealthKit/Health Connect sync (component 2)
    caloriesBurned: 2140, // placeholder until watch sync
    caloriesConsumed,
    proteinG,
  };
}

export function addWorkout(name, durationMin, notes = null) {
  db.runSync(
    'INSERT INTO workouts (name, date, duration_min, notes) VALUES (?, ?, ?, ?);',
    [name, todayISO(), durationMin, notes]
  );
}

export function addMeal(name, time, calories, proteinG) {
  db.runSync(
    'INSERT INTO meals (name, date, time, calories, protein_g) VALUES (?, ?, ?, ?, ?);',
    [name, todayISO(), time, calories, proteinG]
  );
}

export function deleteWorkout(id) {
  db.runSync('DELETE FROM workouts WHERE id = ?;', [id]);
}

export function deleteMeal(id) {
  db.runSync('DELETE FROM meals WHERE id = ?;', [id]);
}

export function updateWorkout(id, name, durationMin) {
  db.runSync(
    'UPDATE workouts SET name = ?, duration_min = ? WHERE id = ?;',
    [name, durationMin, id]
  );
}

export function updateMeal(id, name, calories, proteinG) {
  db.runSync(
    'UPDATE meals SET name = ?, calories = ?, protein_g = ? WHERE id = ?;',
    [name, calories, proteinG, id]
  );
}