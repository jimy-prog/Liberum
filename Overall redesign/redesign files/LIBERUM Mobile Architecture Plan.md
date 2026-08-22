# LIBERUM MOBILE ARCHITECTURE PLAN

**Version:** 1.0 (Phase 1–5 output — pre-implementation)
**Date:** 15 August 2026
**Basis:** Live audit of the production platform at https://www.liberum.uz (teacher and student roles audited with dedicated audit accounts; public surface and auth flows fully inspected).
**Status:** FOR REVIEW — implementation must not begin until this plan is approved.

---

## 0. Executive summary

Liberum today is a **server-rendered Python web application** (Jinja-style templates + vanilla JS) served behind nginx on a single host, with **Firebase Authentication** (email/password + Google OAuth) as the identity layer and a **separate React/Vite marketing site** mounted at `/static/landing/`. It serves two roles — **teacher** and **student** — with a third administrative tier implied ("owner"). The product covers scheduling, groups, students CRM, waitlist, attendance, homework, performance, placement testing, a digital library (grammar, audiobooks/podcasts, **Lexi AI Tutor**), courses (Pre-IELTS / IELTS / Intensive), **Mock Tests (IELTS & SAT)**, finance/payments/payroll in UZS, online teaching, and monthly reports.

**The single most important architectural finding:** the web app is rendered server-side with HTML form posts; there is **no general-purpose JSON API** today — only `/api/auth/firebase`, `/api/auth/onboarding`, and a handful of ad-hoc JSON endpoints. A mobile client therefore requires a **new, versioned REST API layer (`/api/v1`) added to the existing backend**, sharing the same database, business logic, and auth — without touching existing web routes (per the "do not break the web" rule).

**Recommended mobile stack:** **React Native + Expo + TypeScript**, one codebase for iOS and Android, consuming `/api/v1` with Firebase token authentication, inheriting the audited Liberum design tokens.

---

## 1. Existing technology stack (audited)

| Layer | Technology | Evidence from audit |
|---|---|---|
| Marketing site | React 18 + Vite SPA, Tailwind-style utility classes, GSAP, mounted at `/static/landing/` | `index-*.js` bundle, static assets |
| Web application | Server-rendered HTML (Jinja-style), vanilla JS, modals, `<form>` POSTs | All app pages return full HTML; actions like `/groups/add`, `/students/add`, `/payments/all-paid` |
| Backend framework | Python, FastAPI-style (`{"detail": ...}` JSON errors), itsdangerous-signed session cookies | `/login`, `/api/auth/firebase` responses |
| Auth | Firebase Auth v11 (`liberum-f13ff` project): email/password + Google OAuth; classic username/password fallback via `POST /login` | Login page source |
| Session/CSRF | Signed `csrf_token` cookie (1 h), `X-CSRF-Token` header; session cookie after login | Cookie + header inspection |
| Server/infra | nginx 1.24.0 (Ubuntu), single VPS (130.61.234.227), HTTPS, security headers (X-Frame-Options DENY, nosniff, strict referrer policy, `microphone=(self)` permission policy) | Response headers |
| Analytics/monitoring | LogRocket (`jgqnaa/liberum`), Google Analytics via Firebase `measurementId` | Inline scripts |
| Charts | Chart.js 4.4.0 | Finance/dashboard pages |
| Media policy | Microphone allowed for self; camera denied | `permissions-policy` header — relevant for Speaking recording |
| Database | Not directly observable; single-host deployment strongly suggests SQLite or co-located Postgres/MySQL | — (open question) |
| Legacy/secondary service | Placement tablet flow references `teacher-admin.onrender.com` | Placement page — indicates a prior Render-hosted service; needs clarification |

**Implication for mobile:** no shared TypeScript model layer exists between web frontend and backend today (web is templates, not an SPA). Code sharing between web app and mobile is therefore limited; sharing happens **through the API and a design-token package**, not through UI code.

## 2. Backend architecture

**Current (audited):**

```
Browser ──► nginx ──► Python web app (server-rendered HTML + form POSTs + minimal JSON)
                 ├──► Firebase Auth (identity verification)
                 ├──► Database (sessions, users, groups, students, finance, mock, library…)
                 └──► Static marketing SPA at /static/landing/
```

- HTML pages mutate state via classic form POSTs (`/groups/add`, `/homework/add`, `/students/add`, `/waitlist/add`, `/payments/all-paid`, `/profile/update`, `/settings/update`, `/settings/change-password` …) and a small set of `fetch()` JSON calls (`/attendance/update`, `/performance/quick-save`, `/placement/session/initiate-json`, `/timetable/attendance/quick`, `/mark-all-present/<id>`, `/students/search`, `/students/phone-check`, `/students/<id>/log-call`, `/waitlist/<id>/log-call`).
- Auth endpoints under `/api/`: `POST /api/auth/firebase`, `POST /api/auth/onboarding`.

**Target (addition only, non-breaking):**

```
                 ┌────────────── Existing web routes (unchanged) ──────────────► Web
nginx ──► App ───┤
                 └──► NEW /api/v1 (JSON, token-authenticated, versioned) ──────► Mobile
```

Rules:
1. `/api/v1` reuses existing services/DB layer — **no duplicated business logic**, no mobile-only database.
2. Existing HTML routes, cookies, and CSRF flows remain untouched.
3. Where mobile needs data that today only exists inside rendered HTML, the smallest safe change is to extract the underlying query into a shared service function and expose it as JSON — **documented first** in §23 (per the master prompt rule).
4. API versioning from day one (`/api/v1`) so web/mobile can evolve independently.

## 3. Authentication architecture (audited + proposal)

**Current flows:**
1. **Firebase email/password** → client SDK obtains ID token → `POST /api/auth/firebase {idToken, role}` → server verifies with Firebase Admin → server session cookie. New users → `requires_onboarding: true` → `POST /api/auth/onboarding {idToken, full_name, phone, role}`.
2. **Google OAuth** → same `/api/auth/firebase` exchange.
3. **Classic username/password** → `POST /login {identifier, password}` (CSRF-protected, cookie session) → redirect by role (student → `/mock`, teacher → `/dashboard`).
4. Registration page: email + name + password + role (student/teacher) via Firebase.
5. Students additionally have a **tablet PIN** concept (placement tests) — separate from account auth.

**Mobile architecture:**
- **Do not create a separate auth system.** Mobile uses the **Firebase client SDK directly** (React Native Firebase / Expo `expo-firebase` or REST fallback): email/password, Google Sign-In (native), and Apple Sign-In (required by App Store guideline 4.8 if Google is offered).
- After Firebase sign-in, mobile sends the **Firebase ID token in the `Authorization: Bearer` header** to `/api/v1/*`. The backend verifies it with the Firebase Admin SDK on every request (stateless) and maps it to the existing user record — the same identity used by web sessions.
- One new endpoint family is needed: `POST /api/v1/auth/session` (token exchange/introspection), `POST /api/v1/auth/onboarding` (JSON mirror of the existing onboarding for mobile registrations), and role claim resolution identical to web.
- Classic username/password accounts (non-Firebase) must also work on mobile: add `POST /api/v1/auth/login {identifier, password}` returning a short-lived API token, so account types stay unified. (Documented as an API gap in §23.)
- Token storage: `expo-secure-store` (iOS Keychain / Android Keystore). Never AsyncStorage.
- Session expiry: Firebase ID tokens expire in 1 h; the app refreshes silently via the Firebase SDK refresh token. 401 → refresh → retry once → re-login screen.
- Same-account guarantee (register web → login mobile and vice versa) is satisfied because both clients resolve to the same user table via Firebase UID / username.

## 4. User roles (audited)

| Role | Evidence | Mobile treatment |
|---|---|---|
| **Teacher** | Full sidebar: Dashboard, Timetable, My Classes, Review Inbox, Groups, Students, Waitlist, Homework, Performance, Digital Library, Courses, Mock Tests, History, Support, Finance, Payments, Online, Monthly Report, Archive, Settings | Full teacher experience (§7 matrix) |
| **Student** | Reduced sidebar: Dashboard, Digital Library, Courses, Mock Tests, History, Support, Settings. Student dashboard shows enrollment-gated empty state ("not assigned to any active academic group") | Dedicated student experience; never exposes teacher UI |
| **Owner / admin** | Referenced in product language; owner credentials provided did not authenticate, so admin surface could not be audited | Phase 2 input needed — see §23 |

Permission rules for mobile:
- Role is resolved **server-side** and returned in `GET /api/v1/me` (`role`, permissions, organization/school context).
- The mobile app builds navigation from this payload — not from hardcoded role checks — so future roles (owner, parent, organization admin) flow through without app updates.
- Backend enforces authorization on every endpoint (hiding buttons is UX, not security — per master prompt §8).

## 5. API inventory

**Audited existing endpoints:**

| Endpoint | Method | Type | Purpose |
|---|---|---|---|
| `/login` | POST | JSON (CSRF cookie + header) | Classic identifier/password login |
| `/api/auth/firebase` | POST | JSON | Firebase ID-token → session exchange |
| `/api/auth/onboarding` | POST | JSON | Complete profile for new Firebase users |
| `/logout` | GET | — | Sign out |
| `/attendance/update` | POST | JSON fetch | Mark/update attendance |
| `/timetable/attendance/quick` | POST | JSON fetch | Quick attendance from timetable |
| `/mark-all-present/<lesson_id>` | POST | JSON fetch | Bulk attendance |
| `/timetable/mark-all/<lesson_id>` | POST | JSON fetch | Bulk attendance (timetable) |
| `/performance/quick-save` | POST | JSON fetch | Save performance marks |
| `/placement/session/initiate-json` | POST | JSON | Start placement test session |
| `/students/search` | GET/POST | JSON | Live student search |
| `/students/phone-check` | POST | JSON | Duplicate phone check |
| `/students/<id>/log-call` | POST | JSON | CRM call logging |
| `/waitlist/<id>/log-call` | POST | JSON | Waitlist call logging |
| `/groups/add`, `/classes/create`, `/homework/add`, `/students/add`, `/waitlist/add`, `/payments/all-paid`, `/profile/update`, `/profile/upload-photo`, `/settings/update`, `/settings/profile/update`, `/settings/change-password` | POST | HTML form | State mutations (web-only today) |
| All page routes (`/dashboard`, `/timetable/`, `/students/`, `/mock/` …) | GET | HTML | Data only available embedded in pages |

**Gap:** everything the mobile app needs beyond auth is currently HTML-embedded. §23 lists the `/api/v1` surface to build.

## 6. Current feature inventory (audited, by module)

**Teaching operations (teacher):**
- **Dashboard** — month at a glance: income earned (UZS), lessons done, attendance rate, payment status; today's classes; quick actions (add lesson).
- **Timetable** — day/week/month views, date navigation, active/archived filter, export/print, quick attendance.
- **My Classes** — public classes with **invite codes** for student self-enrollment.
- **Groups** — create/edit: name, type (Group/Individual), mode (In-person/Online), price/month, teacher %, finance mode (standard/custom), per-lesson override, schedule, color, company, rate type (per lesson/per hour), rate, duration.
- **Students** — CRM: name, phone, parent phone, English level (Beginner→Advanced / A1–C1), email, notes, tablet PIN, attendance %, rate; live search, phone duplicate check, call logging, ban, archive.
- **Waitlist** — enquiries pipeline (New → Contacted → Trial → Enrolled), public join link per teacher (`/join/<slug>`), source tracking (Instagram/Referral/Telegram/Google/Company/Other), trial scheduling, enroll-to-group with level.
- **Homework** — assign (title, group, lesson, due date, description), track open assignments.
- **Performance** — per-group performance marks, quick-save.
- **Placement Tests** — walk-in client sessions with **tablet PIN flow** (teacher starts session → client takes test on tablet via PIN → auto-scored), 200-question bank across levels, results ledger, add-question management.
- **Review Inbox** — student exam review requests (pending/recent, student/exam/submitted/status/action) — human evaluation workflow.

**Content & learning:**
- **Digital Library** — Universal Grammar (A1–C2 topics + interactive tests, manageable engine), Audiobooks & Podcasts (typed, leveled, in-page player), Bookshelf (curated readers; page currently 404/unfinished), **Lexi AI Tutor** — chat tutor with context toggles (profile & goals, recent lessons, mock tests, grammar scores), model selector, quick actions ("Analyze last Mock Test", "Review Grammar", "Practice Weaknesses").
- **Courses** — structured programs: Pre-IELTS (A2→B1, 10 weeks), IELTS (B1+→B2, Band 5.5–6.5, 8 weeks, two internal stages), Intensive (B2→C1).
- **Mock Tests** — catalog filtered by type (IELTS, SAT) and scope (Full Test, Reading Section, Listening Section); exam player with history; "My History" exam record with scores. (Exam-player internals could not be audited: no tests are published to the audited accounts — see §23.)

**Finance (teacher):**
- **Finance** — monthly income per group, countable lessons (Present + Held), rate/lesson formulas, 6-month history chart, active vs archived groups, Excel export.
- **Payments** — expected/collected/outstanding, paid-students ratio, per-student payment status table, record payment (amount, method: Cash/Card/Bank Transfer/Online, notes), mark-all-paid.
- **Online** — online group teaching stats (groups, students, monthly UZS), set-group-online flow.
- **Monthly Report** — printable monthly report (income, groups, lessons), print/save PDF.

**System:**
- **Archive** — archived groups/students, data preserved.
- **Settings/Profile** — profile photo, personal info, school/studio name, bio & bank details (for invoices), dark/light mode, **9 accent color palettes**, global finance defaults, password change, account info.

**Cross-cutting:** dark mode, theme palettes, LogRocket analytics, responsive layout with mobile hamburger (the web app already adapts to narrow viewports).

## 7. Mobile feature matrix

Classification per master prompt §22 (A = must have on mobile, B = should have, C = desktop-first, D = not appropriate).

| Feature | Teacher | Student | Class | Rationale |
|---|---|---|---|---|
| Auth (login/register/reset/logout) | A | A | **A** | Core; unified with web |
| Dashboard ("what do I need right now") | A | A | **A** | Rebuilt as mobile-specific hierarchy |
| Timetable / today's classes | A | A (own lessons) | **A** | Daily core loop |
| Attendance marking (incl. mark-all) | A | — | **A** | Phone is the natural attendance device |
| Students CRM (list, profile, level, search, call log) | A | — | **A** | Daily teacher ops |
| Groups (view; create/edit) | A view / B edit | — | **A/B** | View + key edits mobile; complex finance config desktop-first |
| Waitlist (enquiries, status moves) | B | — | **B** | Useful on the go; pipeline management fine on phone |
| Public classes & invite codes | B | A (join via code) | **A/B** | Student joining by code is a mobile-first flow |
| Homework (assign / submit / track) | A | A | **A** | Both roles daily |
| Mock Tests — take exam (L/R/W/S) | — | A | **A** | Strategic module; dedicated exam UX |
| Mock Tests — catalog & history | A | A | **A** | |
| Review Inbox (teacher evaluation) | A | A (request + receive result) | **A** | Human evaluation loop must work end-to-end on mobile |
| Lexi AI Tutor | A | A | **A** | Differentiator; chat is mobile-native |
| Universal Grammar + tests | B | A | **A/B** | Students practice on phones |
| Audiobooks & Podcasts | B | A | **A/B** | Audio consumption is mobile-first |
| Courses (view/enroll/progress) | B | A | **A/B** | |
| Bookshelf | C (page unfinished on web) | B | **B/C** | Track web completion first |
| Payments recording / status | A | A (own status) | **A** | Teachers record cash payments in person — phone-native |
| Finance analytics / payroll / Excel export | B (view) | — | **B/C** | View summary on mobile; exports desktop-first |
| Monthly report (print/PDF) | C | — | **C** | Print-oriented |
| Placement tests (teacher session control) | B | — | **B** | Tablet flow already exists; phone control panel is a nice-to-have |
| Placement test taking | — | C (tablet/kiosk stays) | **C** | Keep existing tablet flow; do not duplicate initially |
| Archive management | C | — | **C** | Rare, administrative |
| Settings — appearance/themes | B | B | **B** | Follow system + Liberum accent default |
| Settings — finance defaults / rates | C | — | **C** | Desktop-first configuration |
| Profile (photo, bio, bank details) | B | B | **B** | Edit basics on mobile; bank details fine too |
| Support | A | A | **A** | Contact entry points |
| Owner/admin console | ? (unaudited) | — | **C** | Pending owner access; assume desktop-first |

## 8. Mobile information architecture

Two role-scoped trees sharing one shell. Content grouped exactly as the web sidebar (Overview / Teaching / Content / Finance / System) so the mental model transfers — but flattened for mobile.

**Teacher:**
```
Home (today: classes, attention-needed, payments snapshot, activity)
Teaching
 ├─ Timetable (day/week)
 ├─ Attendance (entry point from lesson cards)
 ├─ Students (search, profile, performance)
 ├─ Groups
 ├─ Waitlist
 └─ Review Inbox
Content
 ├─ Homework
 ├─ Mock Tests (catalog, history, review links)
 ├─ Courses
 └─ Library (Grammar, Audio, Lexi AI)
Finance
 ├─ Payments (record, status)
 └─ Finance summary (income, charts)
More (Profile, Settings, Monthly Report link-to-web, Archive view, Support, Sign out)
```

**Student:**
```
Home (today's learning, homework due, mock progress, feedback)
Learn
 ├─ My Group / Lessons / Schedule
 ├─ Courses
 ├─ Homework
 └─ Library (Grammar, Audio, Bookshelf)
Mock
 ├─ Catalog (IELTS/SAT, full/sections)
 ├─ Exam player (Listening/Reading/Writing/Speaking)
 ├─ My History & results
 └─ Request teacher review
AI (Lexi)
More (Profile, Payments status, Settings, Support, Sign out)
```

## 9. Navigation architecture

- **Bottom tab bar, 5 tabs per role** (per §7 hierarchy):
  - Teacher: `Home · Teaching · Content · Finance · More`
  - Student: `Home · Learn · Mock · AI · More`
- Nested native stack navigation inside each tab; tab state preserved when switching.
- **Modal presentations** (iOS sheets / Android dialogs) for: record payment, assign homework, add student/enquiry, attendance sheet, filters.
- **Bottom sheets** for contextual actions (student row → call / log call / ban / archive; lesson → mark attendance / move / cancel).
- **Exam mode** is a dedicated full-screen stack outside the tab bar, with navigation lock (gesture back disabled, confirm-exit dialog) to protect attempt integrity.
- Global search (students, groups, content) accessible from Home.
- Deep links: `liberum.uz/join/<slug>` (waitlist), mock result, homework item — universal links / app links mapped to in-app screens.
- Role-based tab configuration is driven by `GET /api/v1/me` — never hardcoded.

## 10. Screen inventory (initial release)

**Shared (7):** Splash/brand gate; Login; Register (email/Google/Apple); Onboarding (full name, phone, role — mirrors web); Forgot/reset password (Firebase flow); Web-view wrapper (support articles / monthly report); Error/offline full-screen states.

**Teacher (24):** Home dashboard; Timetable (day/week); Lesson detail (roster, attendance, homework link); Attendance sheet (present/absent/late, mark-all); Students list (search/filter); Student profile (info, level, attendance, payments, performance, call log); Add/Edit student; Groups list; Group detail (roster, schedule, finance summary); Group create/edit (simplified); Waitlist list (status filter); Enquiry detail (status pipeline, enroll action); New enquiry; Homework list; Assign homework; Homework submissions/detail; Review Inbox list; Review detail (evaluate submission, scores + feedback); Payments (month selector, status list); Record payment; Finance summary (income, 6-month chart); Mock catalog; Mock history/detail.

**Student (20):** Home dashboard; My lessons/schedule; Lesson detail (materials, homework); Homework list; Homework detail/submit; Courses list; Course detail (weeks/stages); Grammar topics list; Grammar topic + interactive test; Audio list (filters); Audio player; Mock catalog; **Exam: instructions**; **Exam: Listening (audio player + questions)**; **Exam: Reading (passage/questions)**; **Exam: Writing (editor + word count)**; **Exam: Speaking (recorder)**; Exam: review & submit; Exam results (band/scores breakdown); Mock history; Lexi chat; Request review (pick submission → teacher); Payments status; Profile edit; Settings (notifications, appearance, password); Notifications inbox.

*(Counts are for scoping; final list is validated in Phase 5 UX.)*

## 11. Shared design tokens (audited from production)

Tokens are extracted verbatim from the live CSS (`:root` + palette JS) into a shared `design-tokens.json` consumed by both web (as CSS variables) and mobile (as a TS theme object).

**Colors (light theme):**

| Token | Value |
|---|---|
| `--bg` background | `#F6F7FB` |
| `--bg2` surface | `#FFFFFF` |
| `--bg3` surface-2 | `#F0F1F6` |
| `--bg4` surface-3 | `#E8EAF0` |
| `--border` | `#E5E7EB` |
| `--border2` | `#D1D5DB` |
| `--text` primary | `#101114` |
| `--text2` secondary | `#6B6F7A` |
| `--text3` muted | `#9CA3AF` |
| `--accent` (Liberum violet) | `#7B61FF` |
| `--accent2` (pressed) | `#6B51EF` |
| `--accent-glow` | `rgba(123,97,255,0.14)` |
| success `--green` / bg | `#16A34A` / 10% alpha |
| error `--red` / bg | `#DC2626` / 8% alpha |
| warning `--yellow` / bg | `#CA8A04` / 10% alpha |
| info/orange `--orange` / bg | `#EA580C` / 10% alpha |
| neutral `--grey` / bg | `#6B7280` / 12% alpha |
| money `--money` | `#15803D` |

**Accent palettes (user-selectable on web; mobile honors the stored preference):** liberum `#7B61FF`, indigo `#4C6EF5`, teal `#1098AD`, forest `#2F9E44`, violet `#7048E8`, rose `#C2255C`, navy `#1864AB`, slate `#495057`, cyan `#0C8599` (each with darker `-2` variant).

**Typography:** display = **Space Grotesk** (500/600/700); body = **Inter** (400/500/600/700); mono = **JetBrains Mono** (PINs, timers, scores). Mobile type scale (pt): display 28/34, title 22/28, headline 17/24 semibold, body 16/22, subhead 15/20, caption 13/18, micro 11/14 uppercase-tracked (matches web label style).

**Shape/elevation:** radius 14 (cards/sheets), 10 (controls), 999 (pills/buttons — web uses pill buttons); shadows: card `0 18px 50px rgba(17,24,39,.08)`, bar `0 1px 3px rgba(17,24,39,.06)`; dark mode token set mirrors web dark theme. Spacing scale 4-based: 4/8/12/16/20/24/32/44.

**Iconography:** web currently uses emoji glyphs in nav (📊🗓🏫📬👥…). Mobile replaces these with a consistent line-icon set (Lucide-style) mapped 1:1 per module, same terminology, no emoji in production UI. This is a deliberate, documented refinement — brand feel preserved via color/typography/shape.

**Motion:** 150–250 ms ease-out micro-transitions; shared-element transitions on card→detail; exam timer uses non-animated numeric updates; respect Reduce Motion.

## 12. Component architecture

Expo + TypeScript, feature-folder structure:

```
src/
  design/        tokens.ts (generated), theme provider, dark mode
  components/    Button (pill), Card, ListItem, Avatar, Badge/StatusChip,
                 FormField, Sheet, SegmentedControl, Tabs, EmptyState,
                 ErrorState, OfflineBanner, Skeleton, Timer, AudioPlayer,
                 Recorder, WordCountEditor, PinPad, ScoreCard, BandGauge
  features/
    auth/  home/  timetable/  attendance/  students/  groups/
    waitlist/  homework/  mock/ (catalog, exam-engine, results)
    library/ (grammar, audio, bookshelf)  lexi/  payments/  finance/
    reviews/  profile/  settings/
  api/           typed client (generated from OpenAPI), auth interceptor
  state/         queries, session store
  lib/           secure-store, notifications, analytics, deep-links
```

Component rules: every interactive element ≥44 pt touch target; all async screens implement the 11-state matrix (loading/empty/success/error/offline/permission-denied/unauthorized/session-expired/processing/uploading/retry) with recovery actions, never bare "Something went wrong"; exam components are isolated under `features/mock/exam-engine` with their own state machine (§16/§14).

## 13. State management strategy

- **Server state:** TanStack Query (React Query) — caching, background refetch, retry with backoff, pagination, optimistic updates for attendance/payment marking. This is the primary offline-resilience tool.
- **Session/auth:** small Zustand store holding Firebase user + `/api/v1/me` profile + role; persisted securely.
- **Exam state:** dedicated finite-state machine (XState or hand-rolled reducer) per attempt: `idle → instructions → section(listening|reading|writing|speaking) → review → submitting → submitted → results`, with persisted snapshots (see §14). Exam state is never stored in global UI state.
- **UI state:** local component state; sheets/modals via navigation.
- **Forms:** react-hook-form + zod schemas shared conceptually with backend validation.

## 14. Offline / network resilience strategy

Priorities from the master prompt: **never silently lose Mock answers, Writing submissions, Speaking recordings, attendance, homework.**

- **Cache:** TanStack Query persisted cache (MMKV) for read data: dashboard, timetable, students, catalog, history — app opens with last-known data + "offline" banner.
- **Write queue:** mutation outbox persisted in SQLite (`expo-sqlite`): attendance marks, homework submissions, payment records are queued when offline, replayed in order on reconnect with idempotency keys; conflicts surfaced to the user (never silently overwritten).
- **Exam autosave:** every answer change writes to local snapshot within 1 s (debounced); snapshot survives app kill/background; on launch, unfinished attempt is offered for resume. Submission retries with exponential backoff; answers sync to server per-section when online.
- **Writing:** editor drafts autosaved locally every keystroke-batch (5 s), plus on background/unmount; word count local.
- **Speaking:** recordings are written to app-private storage immediately and kept until the server acknowledges receipt + processing; upload resumable/retryable; "don't leave" guard while a recording exists unsent.
- **Connectivity:** NetInfo-driven offline banner + per-screen stale indicators; all failures offer Retry.

## 15. Push notification strategy

- **Transport:** Expo Push API → FCM (Android) / APNs (iOS). Backend stores Expo push tokens per device (`POST /api/v1/devices`).
- **Triggers (backend-driven, mapped to existing events):** new homework assigned; homework deadline approaching; mock result published; AI evaluation complete; teacher feedback/review ready; new message (when messaging ships); class/lesson reminder (from timetable); payment recorded; waitlist status change (teacher).
- **Preferences:** per-category toggles in Settings → Notifications (mirrors "do not spam" rule); quiet hours default 22:00–07:00 local.
- **Deep links:** every notification opens the exact entity screen; exam reminders never during an active attempt.
- **In-app inbox:** notification list under More so history is reachable without push permission.

## 16. Audio / recording architecture

**Playback (Listening mocks, audiobooks, podcasts):**
- `expo-audio` player with background-safe session config; for Listening exams, server-controlled policy: single-play or limited-play enforcement is a backend concern (attempt token + signed, expiring audio URLs), client shows progress, disables scrubbing if spec requires; playback continues with screen locked only where the exam spec allows; interruption (call) auto-pauses and flags the attempt log.
- Question answering continues during playback; autosave active.

**Recording (Speaking):**
- `expo-audio` recorder → m4a/aac, 44.1 kHz mono; hard time limits per question enforced in the state machine.
- Mic permission flow with pre-permission explainer; denial state with Settings deep link; interrupted recording (call/background) is preserved from the partial file.
- Upload: multipart to `/api/v1/mock/attempts/<id>/speaking` with progress UI (Recording → Uploading → Processing → Evaluated), retry, resumable strategy; file retained locally until server confirms.
- Storage check before recording (insufficient-storage state).

## 17. AI integration architecture

- **No AI engine in the app.** Mobile → `/api/v1` → existing AI evaluation service → result → mobile.
- **Writing evaluation:** submission returns `pending`; result delivered via push + polling fallback; UI renders the four IELTS criteria as score cards: Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy, plus overall band and feedback text (confirm exact criteria against the Product Bible — §23).
- **Speaking evaluation:** same lifecycle with criteria Fluency, Lexical Resource, Grammar, Pronunciation.
- **Teacher review loop (audited on web as Review Inbox):** student requests review on a submission → teacher inbox → teacher evaluates (scores + comments) → student notified → result visible on both platforms. Mobile implements both ends.
- **Lexi AI Tutor:** chat UI streaming responses; context toggles (profile & goals, recent lessons, mock tests, grammar scores) mirrored from web; quick-action chips ("Analyze last Mock Test", "Review Grammar", "Practice Weaknesses"); model selector if exposed by backend.
- Loading/processing UX uses skeletons + staged status copy; evaluation failures offer free retry.

## 18. Security architecture

- TLS-only (existing nginx HTTPS); certificate pinning evaluated for release builds.
- Firebase ID token in `Authorization` header; verified server-side per request; no session cookies on mobile.
- Tokens in `expo-secure-store`; biometric unlock (Face ID / fingerprint) optional gate for app open.
- Authorization enforced server-side per role/object ownership (students only see own data; teachers only own students/groups); mobile UI merely reflects permissions from `/api/v1/me`.
- Recordings and submissions in app-private storage; signed, expiring URLs for media playback/download; no media in world-readable locations.
- PII minimization: no contacts/location access requested; analytics pseudonymized (see §19).
- CSRF remains a web-cookie concern only; token API uses CORS-locked origins + no cookies.
- Secrets: none shipped in the app bundle beyond the public Firebase client config (as on web today).
- Jailbreak/root detection: soft warning only (educational context), not blocking.

## 19. Analytics architecture

- Web already runs LogRocket + GA. Mobile adds a product-analytics layer (recommend **PostHog** or reuse LogRocket mobile SDK to keep one vendor) with autocapture off and an explicit event taxonomy:
  `app_open, register, login, onboarding_complete, mock_started, mock_section_completed, mock_submitted, writing_submitted, speaking_recorded, speaking_submitted, ai_evaluation_received, review_requested, teacher_review_submitted, homework_viewed, homework_submitted, attendance_marked, payment_recorded, lexi_message_sent, notification_opened, offline_sync_completed`.
- User identity: hashed user id + role only; no free-text content (essays, recordings, names) in events.
- Funnels: onboarding completion; mock start→submit; speaking record→upload→result.
- Retention cohorts per role; exam-mode drop-off tracking drives UX iterations.

## 20. Testing strategy

- **Unit:** token theming, reducers/state machines (exam engine 100% branch coverage), API client mappers, offline outbox ordering/idempotency.
- **Component:** React Native Testing Library for the 11-state matrix on key screens.
- **Integration:** MSW-mocked API; exam flow end-to-end offline→kill→resume→submit.
- **E2E:** Maestro (or Detox) golden paths — teacher: login → today's class → attendance → record payment; student: login → mock listening+writing+speaking → submit → result; review loop both ends.
- **Contract:** OpenAPI-generated types + contract tests against staging `/api/v1` so web/backend changes break CI, not the app.
- **Device matrix:** iPhone SE (small), iPhone 16 Pro, mid-range Android (small), Pixel (large), plus a tablet sanity pass; iOS 16+/Android 10+ floor (confirm against user base).
- **Real-network resilience:** airplane-mode, 3G throttling, and interruption testing (calls during recording/listening).
- **Beta:** TestFlight + Google Play internal track to the owner/teachers before public release.

## 21. App Store / Google Play strategy

- **Identity:** app name "Liberum"; bundle ids `uz.liberum.app`; icon = Liberum mark on `#7B61FF` (recognizable at 48 px); splash = brand violet → logo.
- **Sign in with Apple** implemented alongside Google (App Store policy requirement for third-party login).
- **Permissions copy:** microphone ("record Speaking mock answers"), notifications ("homework, results, reminders"); no camera/contacts/location.
- **Privacy labels:** account-linked identifiers (email, name), user content (essays, audio), no tracking; data not sold. Play Data Safety form mirrors this.
- **Store assets:** screenshots from device matrix (Home, Mock exam, Results, Lexi, Payments), short description from existing positioning ("all-in-one platform for teachers and language schools").
- **Release management:** EAS Build + Submit; staged rollout (10% → 50% → 100%); versioned OTA updates via EAS Update for JS-only fixes (never for exam-integrity logic without review).
- **No submission without explicit owner authorization** (per master prompt §32).

## 22. Development roadmap

| Phase | Scope | Exit criteria |
|---|---|---|
| **0 — Inputs (this plan)** | Audit complete; owner credentials & Product Bible gaps closed | Plan approved |
| **1 — Foundation (2–3 wks)** | Expo scaffold, design tokens, auth (Firebase + classic), `/api/v1` skeleton (`/me`, devices), role shell, CI | Login both roles on device |
| **2 — Daily core (3–4 wks)** | Home, timetable, attendance, students read, homework view/submit, notifications v1 | Teacher runs a class day from phone |
| **3 — Mock engine (3–4 wks)** | Catalog, exam player L/R/W/S, offline snapshots, submission, results, history | Full IELTS mock completed on airplane-mode-recovery test |
| **4 — AI & review (2–3 wks)** | Writing/Speaking AI results UI, review request loop, Lexi chat | End-to-end review loop on mobile |
| **5 — Money & CRM (2–3 wks)** | Payments record/status, finance summary, waitlist, groups view/edit-lite | Teacher records payment in person |
| **6 — Library & polish (2 wks)** | Grammar, audio, courses; accessibility sweep; performance pass; store assets | Beta on TestFlight/Play internal |
| **7 — Hardening (1–2 wks)** | E2E matrix, staged rollout prep, privacy forms, owner sign-off | Submission candidate |

Parallel workstream from Phase 1: backend `/api/v1` endpoints per §23.

## 23. Risks, gaps, and required inputs

**Blocking inputs needed from the product owner:**
1. **Owner/admin credentials failed** — the provided `owner / Liberum2026!` and both demo logins (`Teacher_demo1`, `Student_demo1`) were rejected by both classic and Firebase auth. Audit used freshly registered accounts (`audit.teacher.kimi@gmail.com`, `audit.student.kimi@gmail.com`) instead. → Please confirm working credentials; owner-side features (mock publishing, admin console, cross-teacher data) remain unaudited.
2. **Liberum Product Bible / Wiki was not provided** — terminology, permission matrix, Mock spec (playback limits, section timing), and AI criteria herein are from the live product, not the Bible. → Please share it before Phase 1.
3. **Mock exam player internals** — no published tests were visible to audit accounts; Listening/Reading/Writing/Speaking player behavior (timing, playback limits, question types) is specified from the master prompt, not from observation. → Publish a demo test to the audit accounts or grant owner access.

**Technical risks:**
| Risk | Impact | Mitigation |
|---|---|---|
| No JSON API exists; mobile needs `/api/v1` built on a live production backend | High | Additive-only changes, feature-flagged, contract-tested; smallest safe change per endpoint |
| Server-rendered mutations (form POSTs) may embed logic not reachable via services | Medium | Refactor to shared service functions before exposing JSON; never duplicate logic |
| Auth duality (Firebase + classic accounts) | Medium | `/api/v1/auth/login` bridge for classic accounts; long-term: migrate classic users to Firebase |
| Speaking recording integrity on cheap Android devices | Medium | Local-first recording, resumable upload, interruption tests in matrix |
| Exam integrity (single-attempt, playback limits) enforced client-side only | High | Enforcement in backend attempt tokens; client UX mirrors it |
| Single-host backend capacity under mobile polling/push fan-out | Medium | Push over polling; ETag/caching; load test before rollout |
| Legacy reference to `teacher-admin.onrender.com` (placement tablet flow) | Low | Clarify whether a second backend exists; keep tablet flow untouched |
| Bookshelf module unfinished on web (404) | Low | Exclude from mobile v1; track web completion |

**Non-goals for v1 (documented):** owner console, monthly report generation, placement-test taking on phones, Excel exports, advanced finance configuration.

## 24. Dependencies

**Mobile (new):** Expo SDK (RN + TS), React Navigation, TanStack Query, Zustand, react-hook-form + zod, expo-audio, expo-secure-store, expo-sqlite, MMKV, expo-notifications, expo-apple-authentication, @react-native-google-signin, NetInfo, FlashList, react-native-svg (charts), Lucide icons, EAS Build/Submit/Update, Maestro.

**Backend (existing + additions):** existing Python app; Firebase Admin SDK (already implied); new `/api/v1` router + OpenAPI schema; Expo push token registry + notification dispatcher; signed media URL support; attempt-token model for exam integrity. No new database, no changes to existing tables beyond additive columns where unavoidable (all documented before implementation).

**Shared:** `design-tokens.json` package consumed by web CSS and mobile TS — single source of truth for §11 values.

**External services (already in use):** Firebase Auth, LogRocket/GA (web), Expo Push (new), Google/Apple sign-in providers.

---

*Prepared from a live production audit of www.liberum.uz on 2026-08-15. Next step: owner review, credential/Bible inputs (§23), then Phase 1 approval.*
