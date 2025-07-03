# PsyCompanion – UI Overhaul Supplemental Document

---

## 1. Design Principles & Goals

- **Consistency:** All screens and components must follow a unified visual language (colors, typography, spacing, iconography).
- **Modern Aesthetics:** Clean, minimal, and visually appealing. Use soft gradients, subtle shadows, and smooth corners.
- **Delightful Animations:** Transitions, feedback, and micro-interactions should feel smooth and intentional.
- **Accessibility:** High contrast, scalable text, and full keyboard/screen reader support.
- **Responsiveness:** Layouts must adapt gracefully to all device sizes and orientations.

---

## 2. Core Components & Patterns

**To be (re)built or refactored:**

- **App Bar / Header:**  
  - Consistent across all screens, with contextual actions and titles.
- **Tab Bar:**  
  - Modern, animated, with clear active/inactive states.
- **Buttons:**  
  - Primary, secondary, destructive, and icon-only variants.  
  - Consistent sizing, padding, and color usage.
- **Cards:**  
  - For trips, intentions, notes, and reports.  
  - Animated expand/collapse, color-coded by tag.
- **Modals & Dialogs:**  
  - For notes, confirmations, and destructive actions.  
  - Keyboard avoidance, focus management, and clear call-to-action.
- **Inputs:**  
  - Text fields, text areas, sliders, and rating stars.  
  - Clear focus/active states, error handling, and accessibility.
- **Toasts & Feedback:**  
  - Centered, animated, and visually distinct for different actions (success, error, info).
- **Lists & Grouping:**  
  - Minimal, with clear dividers, grouping headers, and swipe/long-press actions where needed.

---

## 3. Screen-by-Screen Overhaul Requirements

**For each screen, specify what needs to be created or refactored:**

### Home
- Apply new app bar, quick stats, upcoming follow-ups, and recent trips in new card/list style.
- Add animated transitions for stats and follow-up prompts.

### Timeline/History
- Refactor to minimal, color-coded cards.
- Add advanced grouping/filtering/sorting UI.
- Integrate animated expand/collapse for trip details.

### Intentions
- Visualize cross-trip progress with new progress bars and stats.
- Modernize intention cards and add notification prompts.

### Trip Details/Reports
- Use new card/modal patterns for notes and reports.
- Add visual tagging for report notes.
- Implement animated transitions between report states (e.g., post-trip → follow-up).

### Notes/Modals
- Refactor all note-taking/editing modals for keyboard avoidance, focus, and new button styles.
- Add ellipsis for long titles and explicit edit buttons.

### Safety, Pre-Trip, Active Trip
- Apply new design system, with minimal/locked trip mode UI.
- Add clear, accessible safety prompts and actions.

### Settings
- Refactor to match new input, toggle, and list styles.

---

## 4. Animation & Interaction Guidelines

- **Navigation:**  
  - Smooth transitions between screens (fade, slide, or scale as appropriate).
- **Card Expansion:**  
  - Animated expand/collapse for trip and intention cards.
- **Button Feedback:**  
  - Ripple or scale effect on press.
- **Toasts:**  
  - Fade/slide in and out, centered on screen.
- **Modal Transitions:**  
  - Slide up from bottom, with background dimming and focus trap.
- **Progress Indicators:**  
  - Animated progress bars for intention completion and report follow-ups.

---

## 5. Accessibility & Responsiveness

- **Text:**  
  - All text must be scalable (support system font size changes).
- **Contrast:**  
  - Meet or exceed WCAG AA contrast ratios.
- **Touch Targets:**  
  - Minimum 44x44pt for all interactive elements.
- **Screen Reader Support:**  
  - All actionable elements must have accessible labels.
- **Orientation:**  
  - Support both portrait and landscape modes.

---

## 6. Technical Implementation Plan

1. **Design Tokens:**  
   - Define color palette, typography, spacing, and shadow tokens in a central config.
2. **Component Library:**  
   - Build/refactor all core components (buttons, cards, modals, etc.) using NativeWind and Tailwind config.
3. **Screen Refactors:**  
   - Overhaul each screen in order: Home → Timeline → Intentions → Trip Details/Reports → Notes/Modals → Safety/Pre-Trip/Active Trip → Settings.
4. **Animation Layer:**  
   - Integrate Reanimated or Moti for all required animations.
5. **Accessibility Pass:**  
   - Audit and fix all accessibility issues.
6. **Testing:**  
   - Manual and automated UI tests for all new/refactored components and screens.
7. **Documentation:**  
   - Document all components, patterns, and usage guidelines for future development.

---

## 7. References & Assets

- [Figma/Design Files] (to be linked)
- [Color Palette & Typography Spec]
- [Component Library Documentation]
- [Animation Guidelines Reference] 