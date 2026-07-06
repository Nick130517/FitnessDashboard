# Fitness Dashboard — Project Roadmap

Personal-use fitness app: smartwatch data + food-photo macro tracking + workout/meal logging + AI coaching, built for sideloading on your own Android phone.

Build order: prove each piece works before adding the next.

---

## 1. Workout/meal tracker + dashboard

- [x] Expo project scaffolded, running via Expo Go
- [x] SQLite database (workouts, meals tables)
- [x] Dashboard: rings (heart rate, calories, steps, distance)
- [x] Dashboard: weekly activity chart (currently mock data)
- [x] Dashboard: activity breakdown donut (currently mock data)
- [x] Dashboard shows last 3 workouts + last 3 meals only
- [x] Git repo set up and synced to GitHub
- [x] Restructured into `app/(tabs)`, `components/`, `db/` folders
- [x] Real date tracking (ISO dates, not frozen "Today" strings)
- [x] 7-day rolling data retention (auto-deletes anything older)
- [x] Empty states for workouts/meals
- [x] Confirm-before-delete (long-press)
- [x] Pull-to-refresh
- [x] Visual overhaul: gradient rings, glow, icon badges, silver panels on black background
- [x] Bottom tab bar: Dashboard, Planner, Coach, Settings
- [x] Planner page: full 7-day workout/meal history + logging (Add moved here from Dashboard)
- [x] Tap-through detail pages for workouts and meals
- [x] Editable workout duration
- [x] Notes section on both workouts and meals
- [ ] Real weekly history (currently mock data — needs daily snapshots stored in SQLite)
- [ ] Workout "type" field (Running/Cycling/etc) so the activity donut reflects real data
- [ ] Recipe storage (originally planned alongside workouts — not yet built)

## 2. Smartwatch sync (HealthKit / Health Connect)

- [ ] Replace placeholder Heart Rate, Steps, Calories Burn, Distance with real data
- [ ] Requires Health Connect (Android) integration
- [ ] Requires switching from Expo Go to a custom dev client (native module needed)
- [ ] Settings page "Connected device" section wired up to real pairing status

## 3. Food photo macro scanner

- [ ] AI image analysis to estimate macros from a meal photo
- [ ] Likely lives inside the Meals section of Planner

## 4. AI coaching chat layer

- [ ] Coach tab currently a placeholder — needs the actual chat interface
- [ ] Fed real context: recent workouts, meals, goals
- [ ] Guardrails: meal ideas/motivation fine; real medical/nutrition questions redirect to a professional
- [ ] Goals/targets settings belong here (weight/height already live in Settings)

## 5. Hosting/backend

- [ ] Still fine to stay fully local (SQLite) unless multi-device sync becomes a priority
- [ ] Optional: lightweight backend on existing always-free Google Cloud VM (same one running Jarvis)
- [ ] Desktop app with sync between phone and desktop — real multi-device sync via a shared backend (this is a big enough undertaking to become its own separate project with its own detailed roadmap, further down the line)

---

## Settings page (built so far)

- [x] Weight, height (with unit conversion)
- [x] Sex (male/female)
- [x] Units toggle (metric/imperial) — converts existing values live
- [x] Connected device section (placeholder until Health Connect exists)
- [x] Data management — separate "Clear all workouts" / "Clear all meals" actions
- [ ] Goals/targets (deferred to Coach tab)
- [ ] Notifications (deferred until a feature needs them)
- [ ] Theme toggle (currently hardcoded dark — low priority)

---

*Last updated: reflects state as of this conversation. Update the checkboxes as items are completed, and add new lines as new ideas come up.*