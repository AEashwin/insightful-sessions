

# DD 3.0 — MMM Analyst Platform (Revised)

Production-quality SaaS build with polished navigation, structured layouts, and DD 2.0-level finish.

## Design System

- **Primary:** `#534AB7` (deep purple)
- **Font:** Inter via Google Fonts
- **Backgrounds:** White main, `#F7F7F5` sidebar
- **Status:** Green (complete), Amber (warning), Grey (draft)
- **Style:** Crisp borders, subtle shadows, micro-interactions (hover states, transitions), pixel-perfect spacing
- **CSS variables** in `index.css` updated for the purple palette

## Global Shell (all screens)

A persistent app shell wrapping all routes:

- **Top header bar** (h-14, dark navy `#1E1B3A`): "DD 3.0" logo left, breadcrumb/page title center, notification bell + user avatar dropdown right (avatar with initials fallback, dropdown with "Settings", "Sign out")
- **Consistent max-width container** with responsive padding
- Smooth page transitions between routes

## Screen 1 — Project Selector (`/`)

- Card-based layout centered on page
- Search input with icon, debounced filtering
- 6 project rows: name, brand/market tags (Badge component), status badge (green/amber/grey), relative date, chevron
- Selected row highlighted with purple left border + light purple bg
- Summary panel slides in below with 4 stat cards (icon + value + label), two action buttons, AI note
- "Resume workflow" navigates to `/workflow`

## Screen 2 — Workflow Tracker (`/workflow`)

- SidebarProvider layout using shadcn Sidebar component (280px, collapsible)
- Sidebar: project name, session timer, progress bar, 9-stage vertical stepper with status icons, platform connection + token usage footer
- Main area: active stage heading + subtitle, sub-task checklist with status colors, "Next step" card, embedded chat input
- Clicking completed stages updates main panel content
- Stages 3 and 4 link to `/classification` and `/model-output` respectively

## Screen 3 — Variable Classification (`/classification`)

- App shell header + back breadcrumb to workflow
- Status summary bar with variable counts
- Filter chip row (interactive) + search input
- Full-width table (12 rows) with inline dropdowns (Select component), sign toggles, flag checkboxes
- Flagged rows turn amber with inline correction note input
- Fixed bottom action bar: warning count, "Apply AI suggestions" (clears flags), "Save & Continue"

## Screen 4 — Model Output (`/model-output`)

- App shell header + breadcrumb back to workflow
- 3 metric cards with tinted backgrounds and threshold labels
- CSS horizontal stacked bar chart with legend for contribution decomposition
- 8-row performance table with color-coded ROI badges
- Amber limitation banner
- AI interpretation card (purple left border) with expandable follow-up chat input
- "Proceed to Simulation" button

## File Structure

- `src/components/layout/AppHeader.tsx` — global header with logo, avatar, nav
- `src/components/layout/AppShell.tsx` — wraps header + content area
- `src/components/workflow/WorkflowSidebar.tsx` — sidebar stepper
- `src/pages/Index.tsx` — project selector
- `src/pages/Workflow.tsx` — workflow tracker
- `src/pages/Classification.tsx` — variable classification
- `src/pages/ModelOutput.tsx` — model output summary
- Routes added to `App.tsx`

## Polish Details

- Hover states on all interactive rows/buttons (scale, bg shift)
- Transition animations on panel reveals (summary panel, chat input)
- Proper focus rings and keyboard navigation
- Responsive: sidebar collapses on smaller screens
- Loading skeleton states on data sections
- Consistent 8px spacing grid throughout

