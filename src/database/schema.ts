export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  age INTEGER NOT NULL CHECK (age >= 10 AND age <= 120),
  sex_equation TEXT NOT NULL CHECK (sex_equation IN ('male', 'female')),
  height_cm REAL NOT NULL CHECK (height_cm >= 50 AND height_cm <= 260),
  current_weight_kg REAL NOT NULL CHECK (current_weight_kg >= 20 AND current_weight_kg <= 400),
  target_weight_kg REAL NOT NULL CHECK (target_weight_kg >= 20 AND target_weight_kg <= 400),
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very', 'extra')),
  goal_type TEXT NOT NULL CHECK (goal_type IN ('lose', 'maintain', 'gain')),
  calorie_target_custom INTEGER,
  target_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS food_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  source TEXT NOT NULL CHECK (source IN ('local', 'custom', 'usda', 'openfoodfacts')),
  source_id TEXT,
  serving_size_g REAL NOT NULL DEFAULT 100,
  serving_unit TEXT NOT NULL DEFAULT 'g',
  calories_per_100g REAL NOT NULL,
  protein_per_100g REAL NOT NULL DEFAULT 0,
  carbs_per_100g REAL NOT NULL DEFAULT 0,
  fat_per_100g REAL NOT NULL DEFAULT 0,
  fiber_per_100g REAL DEFAULT 0,
  sodium_mg_per_100g REAL DEFAULT 0,
  potassium_mg_per_100g REAL DEFAULT 0,
  calcium_mg_per_100g REAL DEFAULT 0,
  iron_mg_per_100g REAL DEFAULT 0,
  is_custom INTEGER NOT NULL DEFAULT 0,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name);
CREATE INDEX IF NOT EXISTS idx_food_items_source ON food_items(source);
CREATE INDEX IF NOT EXISTS idx_food_items_favorite ON food_items(is_favorite);

CREATE TABLE IF NOT EXISTS food_entries (
  id TEXT PRIMARY KEY,
  food_item_id TEXT,
  food_name_snapshot TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  quantity REAL NOT NULL CHECK (quantity > 0),
  quantity_unit TEXT NOT NULL,
  quantity_grams REAL NOT NULL CHECK (quantity_grams > 0),
  calories REAL NOT NULL,
  protein_g REAL NOT NULL,
  carbs_g REAL NOT NULL,
  fat_g REAL NOT NULL,
  fiber_g REAL DEFAULT 0,
  sodium_mg REAL DEFAULT 0,
  potassium_mg REAL DEFAULT 0,
  calcium_mg REAL DEFAULT 0,
  iron_mg REAL DEFAULT 0,
  entry_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_food_entries_date ON food_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_food_entries_date_meal ON food_entries(entry_date, meal_type);

CREATE TABLE IF NOT EXISTS saved_meals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  meal_type TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS saved_meal_items (
  id TEXT PRIMARY KEY,
  saved_meal_id TEXT NOT NULL,
  food_item_id TEXT NOT NULL,
  quantity REAL NOT NULL,
  quantity_unit TEXT NOT NULL,
  quantity_grams REAL NOT NULL,
  FOREIGN KEY (saved_meal_id) REFERENCES saved_meals(id) ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weight_entries (
  id TEXT PRIMARY KEY,
  weight_kg REAL NOT NULL CHECK (weight_kg >= 20 AND weight_kg <= 400),
  entry_date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_weight_entries_date ON weight_entries(entry_date);

CREATE TABLE IF NOT EXISTS daily_activity (
  id TEXT PRIMARY KEY,
  activity_date TEXT NOT NULL UNIQUE,
  steps INTEGER NOT NULL CHECK (steps >= 0 AND steps <= 150000),
  step_goal INTEGER NOT NULL DEFAULT 8000 CHECK (step_goal > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_daily_activity_date ON daily_activity(activity_date);

CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
  calorie_unit TEXT NOT NULL DEFAULT 'kcal' CHECK (calorie_unit IN ('kcal', 'kJ')),
  weight_unit TEXT NOT NULL DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
  default_step_goal INTEGER NOT NULL DEFAULT 8000,
  protein_ratio REAL NOT NULL DEFAULT 0.30,
  carbs_ratio REAL NOT NULL DEFAULT 0.40,
  fat_ratio REAL NOT NULL DEFAULT 0.30,
  onboarding_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;
