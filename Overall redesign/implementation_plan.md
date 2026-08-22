# Goal Description
Migrate the entire backend template structure and navigation to match the newly provided SPA categorised layout. Instead of a long, unwieldy left sidebar, the platform will use 6 main sidebar categories (Home, Schedule, Students, Learning, Mock Tests, Money). Each category will have an internal sub-navigation bar (`.segs`) to switch between the sub-pages. All existing backend functions, forms, and data will be adapted to fit inside the new UI components (`.card`, `.row`, `.rmain`, `.pill`, etc).

## Open Questions
- Should the "Owner Admin" tools (Platform Updates, All Users, Manage Mocks) get their own main sidebar tab for Owners? (For now, I will group them under an "Admin" or "Owner" sidebar tab if the user is an owner, or put them under Settings).
- Do we keep the exact backend routes and just change the template UI? (Yes, the backend Python routes will remain untouched, only the HTML templates and Jinja logic will be modified to match the new component design).

## Proposed Changes

### 1. Update Navigation Routing in `base.html`
Modify the `aside.side` in `base.html` to ONLY contain the primary categories:
- Home (`/dashboard` or `/owner/`)
- Schedule (`/timetable/`)
- Students (`/students/`)
- Learning (`/library/`)
- Mock Tests (`/mock/test` or `/reviews/inbox`)
- Money (`/payments/`)
- Owner Admin (`/owner/updates` etc, if owner)

### 2. Implement the "Students" Section
Map the following routes to have a `.segs` top bar:
- `/students/` -> `students.html`
- `/groups/` -> `groups.html`
- Waitlist -> `waitlist.html`
- Placement -> `placement_dashboard.html`
**Changes:** Rewrite these HTML files to use `.segs` for navigation, and `.card`, `.row` for lists of students/groups.

### 3. Implement the "Schedule" Section
- `/timetable/` -> `timetable.html`
- `/classes/` -> `teacher_classes.html`
**Changes:** Rewrite using `.wk` grid for calendar and `.row` for classes.

### 4. Implement the "Money" Section
- `/payments/` -> `payments.html`
- `/finance/` -> `finance.html`
- `/monthly-report/` -> `monthly_report.html`

### 5. Implement the "Mock Tests" Section
- `/mock/test` -> `mock_dashboard.html`
- `/mock/history` -> `mock_history.html`
- `/reviews/inbox` -> `teacher_reviews.html`

### 6. Implement the "Learning" Section
- `/library/` -> `library/teacher_dashboard.html`

## Verification Plan
1. Test each navigation flow in the UI to ensure the `.segs` buttons correctly light up.
2. Ensure every existing button (e.g. "Add Student", "Add Group") functions as it did before.
3. Visually match each page against the `spa_app.html` mockup.
