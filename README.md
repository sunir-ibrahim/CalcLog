# CalcLog — Local-First Calorie & Fitness Tracker Mobile App

CalcLog is a production-quality, privacy-respecting, zero-backend personal nutrition and fitness tracking application built with **React Native**, **Expo Router**, **TypeScript**, and **SQLite (`expo-sqlite`)**.

---

## 🌟 Core Principles

- **Zero Login & Registration**: Open the app and begin tracking immediately. No email, password, or third-party auth required.
- **Local-First & Offline-Default**: All profile metrics, food logs, weight measurements, and step entries live directly in persistent SQLite on the physical device.
- **Snapshot Immutability**: Logged meals freeze nutritional values (`calories`, `protein_g`, `carbs_g`, `fat_g`) at the time of entry so future edits to the food database never alter past history.
- **Multi-Source Nutrition Integration**:
  - Bundled offline catalog of curated Indian foods, whole foods, and kitchen staples.
  - Optional real-time search across USDA FoodData Central and Open Food Facts with local SQLite caching.
- **Pure Calculation Engine**: Decoupled, fully tested implementations of Mifflin–St Jeor BMR, TDEE, configurable macro targets, and adult BMI screening ranges.

---

## 🚀 Key Features

1. **First-Launch Profile Wizard (`/onboarding`)**:
   - Collects age, biological equation baseline (male/female), height (cm), current weight (kg), target weight (kg), activity level (sedentary to extra active), and primary goal (lose/maintain/gain).
   - Real-time preview of BMR, TDEE, and daily target calories with safety minimums (1,200 kcal for female, 1,500 kcal for male).
   - Persists completion flag so returning users launch straight to the dashboard.

2. **Home Dashboard (`/(tabs)/index`)**:
   - Calorie summary with interactive SVG progress ring displaying target, consumed, and remaining (or non-judgmental overage).
   - Macronutrient progress bars for Protein, Carbohydrates, and Fat.
   - Daily Manual Step Summary card with goal progress, remaining steps, and celebratory completion state.
   - Body Weight card showing current weight, target delta, and recent change trend.
   - Date navigator to review past days with reactive daily totals.

3. **Food Diary (`/(tabs)/food-diary`)**:
   - 4 meal categories: Breakfast, Lunch, Dinner, and Snacks.
   - Add, edit serving portions, or delete logged foods.
   - Per-meal and daily aggregate macronutrient totals.

4. **Multi-Source Food Search & Custom Food Creation**:
   - Fast local search over Indian dishes (Idli, Dosa, Sambar, Chapati, Dal, Rice, Curd, Chicken Curry, Paneer, Fish, Oats, etc.).
   - Remote queries against USDA FoodData Central and Open Food Facts when online with offline status notifications.
   - Portion logger with multiple serving units (`g`, `piece`, `bowl`, `cup`, `tbsp`) and real-time scaled nutrition calculations.
   - Custom food creator with per-100g nutritional facts.

5. **Manual Step Tracker (`/(tabs)/activity` & `/step-modal`)**:
   - Enter daily total steps with validation against a 150,000-step ceiling.
   - Preserves one record per calendar date.
   - 14-day to 30-day visual activity history.

6. **Weight Progress & Interactive Trends (`/(tabs)/progress` & `/weight-modal`)**:
   - Log body weight with date selector and optional measurement notes.
   - Interactive SVG weight trend chart with dynamic range scaling.
   - Adult BMI screening metric with healthy weight bounds and medical disclaimers.

7. **Profile Settings & Themes (`/(tabs)/profile`)**:
   - Modify biometrics, goals, and activity levels with instant target recalculation.
   - Custom calorie target overrides and customizable daily step goals.
   - Light, Dark, and System theme toggles.

8. **Local Data Management (`/data-management`)**:
   - **Export**: Generates structured, schema-versioned JSON containing all profile, settings, food, step, and weight entries.
   - **Import**: Schema validation and atomic SQLite transactions with choice of *Replace* or *Merge* modes.
   - **Wipe**: Securely deletes all local records and re-seeds pristine default state.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React Native (`0.88.x`) & Expo SDK (`58.0.x`) |
| **Navigation** | Expo Router (`58.0.x`) file-based routing |
| **Language** | TypeScript |
| **Database** | SQLite via `expo-sqlite` |
| **Key-Value Store** | `@react-native-async-storage/async-storage` |
| **Vector Graphics** | `react-native-svg` |
| **Iconography** | `@expo/vector-icons` (Ionicons) |
| **Testing** | Jest (`30.x`) & `ts-jest` |

---

## 📂 Project Directory Structure

```text
CalcLog/
├── __mocks__/
│   └── expo-sqlite.js           # Jest mock for Node testing
├── __tests__/
│   ├── calculations.test.ts     # BMR, TDEE, macros, BMI, and portion tests
│   ├── dateUtils.test.ts        # ISO calendar date manipulation tests
│   ├── steps.test.ts            # Step progress & validation tests
│   ├── weight.test.ts           # Weight history & trend analysis tests
│   └── backupValidation.test.ts # Backup JSON schema tests
├── src/
│   ├── app/                     # Expo Router File-Based Navigation
│   │   ├── _layout.tsx          # Root Layout (Theme & DB Providers, Onboarding router)
│   │   ├── index.tsx            # Root redirect to (tabs)
│   │   ├── onboarding.tsx       # First-launch Profile & Goal Wizard
│   │   ├── step-modal.tsx       # Manual step entry modal
│   │   ├── weight-modal.tsx     # Weight recording modal
│   │   ├── data-management.tsx  # JSON backup export, import & wipe
│   │   ├── (tabs)/              # Main App Bottom Tabs
│   │   │   ├── _layout.tsx      # Tab bar styling & icons
│   │   │   ├── index.tsx        # Dashboard (Calorie ring, Macros, Steps, Weight)
│   │   │   ├── food-diary.tsx   # Food Diary (Breakfast, Lunch, Dinner, Snacks)
│   │   │   ├── activity.tsx     # Step Activity & History
│   │   │   ├── progress.tsx     # Weight Progress & SVG Trend Chart
│   │   │   └── profile.tsx      # Profile Editing & Settings
│   │   └── food/
│   │       ├── search.tsx       # Multi-source food catalog search modal
│   │       ├── details.tsx      # Serving portion logger & scaled nutrition
│   │       └── custom.tsx       # Create custom food screen
│   ├── calculations/            # Pure, tested mathematical calculation engine
│   │   ├── bmr.ts               # Mifflin–St Jeor equations & validation
│   │   ├── tdee.ts              # Activity multipliers (1.2 to 1.9)
│   │   ├── targets.ts           # Goal deficit/surplus & safety floors
│   │   ├── macros.ts            # Macronutrient gram conversions
│   │   ├── bmi.ts               # BMI screening & healthy weight ranges
│   │   ├── portions.ts          # Proportional scaling & unit-to-gram conversion
│   │   └── index.ts             # Orchestrator & barrel exports
│   ├── components/
│   │   ├── ui/                  # Reusable UI tokens (CalorieRing, MacroBar, DateHeader, Card, Button, StepCard, WeightCard)
│   │   └── food/                # FoodItemRow, MealSection
│   ├── constants/
│   │   └── theme.ts             # Color palettes, spacing, and radius tokens
│   ├── context/
│   │   ├── AppDataContext.tsx   # Reactive SQLite state store & mutators
│   │   └── ThemeContext.tsx     # Light/Dark mode state
│   ├── database/
│   │   ├── db.ts                # SQLite database connection & migrations
│   │   ├── schema.ts            # DDL SQL table & index definitions
│   │   ├── seedIndianFoods.ts   # Bundled Indian & pantry staple foods
│   │   └── repositories/        # Typed repositories (profile, food, entry, step, weight, settings, savedMeals)
│   ├── services/
│   │   ├── usdaApi.ts           # USDA FoodData Central REST client
│   │   ├── openFoodFactsApi.ts  # Open Food Facts search client
│   │   ├── nutritionService.ts  # Unified multi-source search orchestrator
│   │   └── backupService.ts     # JSON export, import, and reset service
│   ├── types/                   # TypeScript interfaces (profile, nutrition, database)
│   └── utils/                   # dateUtils.ts, validation.ts
├── eslint.config.js
├── jest.config.js
├── package.json
└── tsconfig.json
```

---

## 🧮 Calorie Calculation Engine Details

### 1. BMR (Mifflin–St Jeor)
- **Male equation**:
  $$\text{BMR} = 10 \times \text{weight}_{\text{kg}} + 6.25 \times \text{height}_{\text{cm}} - 5 \times \text{age}_{\text{years}} + 5$$
- **Female equation**:
  $$\text{BMR} = 10 \times \text{weight}_{\text{kg}} + 6.25 \times \text{height}_{\text{cm}} - 5 \times \text{age}_{\text{years}} - 161$$

### 2. TDEE Multipliers
- **Sedentary**: $\text{BMR} \times 1.2$
- **Lightly active**: $\text{BMR} \times 1.375$
- **Moderately active**: $\text{BMR} \times 1.55$
- **Very active**: $\text{BMR} \times 1.725$
- **Extra active**: $\text{BMR} \times 1.9$

### 3. Goal Calorie Targets & Safety Floors
- **Weight loss**: Conservative $500\text{ kcal}$ deficit. Enforces a safety minimum floor of $1,200\text{ kcal}$ (female baseline) or $1,500\text{ kcal}$ (male baseline) with health guidance flags.
- **Weight maintenance**: $\text{Target} = \text{TDEE}$.
- **Weight gain**: Conservative $350\text{ kcal}$ surplus.

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```
Executes all 32 unit tests verifying calculation formulas, step bounds, weight trends, date handling, and backup schema integrity.

### 3. Typecheck & Lint
```bash
npx tsc --noEmit
npm run lint
```

### 4. Start Development Server
```bash
npx expo start
```
From the interactive terminal prompt:
- Press `a` to open on an Android emulator / physical device.
- Press `i` to open on an iOS simulator (macOS required).
- Press `w` to open in a web browser.
- Scan the QR code using the **Expo Go** mobile app.

---

## 🌐 External Nutrition API Configuration

- **USDA FoodData Central**: Uses the official public REST endpoint with `DEMO_KEY` (no secret API key required).
- **Open Food Facts**: Uses the public Open Food Facts search API with a custom user-agent header.
- **Offline Fallback**: When network access is unavailable, external calls timeout gracefully within 6 seconds, and all searches seamlessly fall back to local bundled SQLite foods. Previously retrieved external items are automatically cached in SQLite.
