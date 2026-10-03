# Life Tracker

A mobile-first, dark navy/black premium life tracking app built for Basant. Designed around daily discipline, calisthenics, healthy weight gain, energy expenditure, and yearly GitHub-style heatmaps.

## Key Features

1. **Daily Points System (Top Hero)**
   - Prominently positioned at the very top of the dashboard.
   - Computes daily points in real-time based on exact nutritional surplus, protein targets, steps, workouts, sleep, and weigh-in consistency.
   - Visual flame hero card with all-time points accumulation and streak tracking.
   - Built-in "How Points Work" modal detailing every rule.

2. **Steps Tracker & Auto Calorie Estimate**
   - Automatically calculates calories burned based on Basant's 48.9 kg weight using the calibrated factor **0.043 kcal/step** (~43 kcal per 1,000 steps).
   - Full 365-day GitHub-style yearly heatmap tracking 10,000 steps daily consistency.

3. **Walk Sessions (Ref-07 Layout)**
   - Orange striped progress bars, huge numerals, pace/BPM sparkline, and stat capsules (km, min, kcal).
   - Empty state with `empty-walks.png`.

4. **Calisthenics & Workouts (Ref-05 Layout)**
   - Dark OLED stat tiles for Total Workouts, Total Minutes, and Kcal Burned.
   - Quick one-tap calisthenics presets (Push & Dips, Pull-ups & Core, Handstand & Mobility).
   - Exercise set and rep breakdowns.
   - Empty state with `empty-workouts.png`.

5. **Meals & Macros**
   - Daily progress bars against **2,300 kcal (maintain) / 2,500 kcal (gain)** and **85–100 g protein**.
   - Frequent food quick-adds (toned milk, paneer bhurji, sooji laddu, dal & roti).
   - Empty state with `empty-meals.png`.

6. **Calories & Metabolism (One Screen, 4 Blocks)**
   - **Block 1**: Consumed food calories broken down by Breakfast, Lunch, Snacks, Dinner.
   - **Block 2**: Burned split into Base BMR (Mifflin-St Jeor: $10 \times 48.9 + 6.25 \times 165 - 5 \times 21 + 5 = 1420$ kcal) + Steps Burned + Workouts.
   - **Block 3**: Net Energy Balance (Surplus vs Deficit).
   - **Block 4**: Target Zone progression bar.

7. **Weight Progression & Milestone Badge**
   - Historical sparkline trend tracking gain from 48.2 kg baseline to 48.9 kg and beyond.
   - Milestone achievement card wired to `badge-weight-gain.png`.
   - Logging weight earns +5 points daily.

8. **Habits Yearly Heatmaps (Ref-04 Layout)**
   - Dedicated heatmaps for Steps, Workouts, Calorie Surplus, Protein 85g+, Sleep 7-8.5h, and Daily Points.
   - Dark navy cards with flame streak counters, total days, month headers, and intensity pill dots.

9. **Data Persistence & Backups**
   - Per-device `localStorage` persistence.
   - Full JSON Export and Import capabilities.
   - Preloaded with Basant's historical 1–2 Oct 2026 data.

10. **Onboarding Tour (Ref-02 Layout)**
    - 3-screen walkthrough with `onboarding-1-energy.png`, `onboarding-2-habits.png`, and `onboarding-3-points.png`.
    - Can be replayed anytime from Settings.

## Tech Stack
- Next.js 15 (App Router)
- React 19 & TypeScript
- Tailwind CSS v4
- Lucide React Icons
