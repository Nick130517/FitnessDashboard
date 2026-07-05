import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('fitness.db');

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
}

export function seedIfEmpty() {
  const workoutCount = db.getFirstSync('SELECT COUNT(*) as count FROM workouts');
  if (workoutCount.count === 0) {
    db.execSync(`
      INSERT INTO workouts (name, date, duration_min, notes) VALUES
        ('Upper Body Strength', 'Today', 45, NULL),
        ('5k Run', 'Yesterday', 28, NULL),
        ('Leg Day', '2 days ago', 52, NULL);
    `);
  }

  const mealCount = db.getFirstSync('SELECT COUNT(*) as count FROM meals');
  if (mealCount.count === 0) {
    db.execSync(`
      INSERT INTO meals (name, date, time, calories, protein_g) VALUES
        ('Chicken & Rice Bowl', 'Today', '1:30 PM', 620, 45),
        ('Protein Shake', 'Today', '9:00 AM', 240, 30);
    `);
  }
}

export function getRecentWorkouts(limit = 5) {
  return db.getAllSync('SELECT * FROM workouts ORDER BY id DESC LIMIT ?;', [limit]);
}

export function getRecentMeals(limit = 5) {
  return db.getAllSync('SELECT * FROM meals ORDER BY id DESC LIMIT ?;', [limit]);
}

export function getTodayStats() {
  const meals = db.getAllSync("SELECT * FROM meals WHERE date = 'Today';");
  const caloriesConsumed = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const proteinG = meals.reduce((sum, m) => sum + (m.protein_g || 0), 0);

  return {
    steps: 8432,
    caloriesBurned: 2140,
    caloriesConsumed,
    proteinG,
  };
}

export function addWorkout(name, durationMin, notes = null) {
  db.runSync(
    'INSERT INTO workouts (name, date, duration_min, notes) VALUES (?, ?, ?, ?);',
    [name, 'Today', durationMin, notes]
  );
}

export function addMeal(name, time, calories, proteinG) {
  db.runSync(
    'INSERT INTO meals (name, date, time, calories, protein_g) VALUES (?, ?, ?, ?, ?);',
    [name, 'Today', time, calories, proteinG]
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