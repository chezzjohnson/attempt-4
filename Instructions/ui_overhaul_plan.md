# ✅ UI Overhaul Implementation Plan – What to Prepare for Cursor

---

## 1. 🧱 Foundational Design Artifacts

### ✅ You MUST Gather/Define:

- **Color Palette**

  - Primary, secondary, accent, surface, background, error, success, warning, info.
  - Specify in hex or Tailwind-compatible tokens.

- **Typography System**

  - Font family names, weights, sizes for: `Heading`, `Subheading`, `Body`, `Caption`, `Label`.

- **Spacing & Sizing Scale**

  - Margin/padding units, breakpoints, corner radii, shadow levels.

- **Component Variants**

  - Define for: Buttons (Primary, Secondary, Destructive), Cards (Default, Intentions, Trips), Inputs, and Modals.

- **Animation Guidelines**

  - Prefer `Moti` or `Reanimated`?
  - Specify what should animate: transitions, expand/collapse, toasts, feedback.

---

## 2. 🧹 Design Tokens File (for Tailwind or NativeWind)

- A JSON or JS/TS file defining your theme tokens. Cursor can build this for you if you give:
  - Color palette
  - Typography specs
  - Spacing scale
  - Shadows and border radius conventions

---

## 3. 🧪 UI Component Definitions (What to Build/Refactor)

### Provide or Clarify:

- List of components you use regularly (already done in your doc 👍)
- Figma OR low-fidelity sketches of:
  - Button styles and states
  - Card layouts
  - Modal positioning
  - Tabs & navigation bars

If you can’t provide Figma, use:

- Drawings or screenshots labeled with features
- Or clear, structured pseudocode of how the component looks and behaves

---

## 4. 📱 Screen Hierarchy + States

### For Each Screen (Home, Timeline, Intentions, etc.):

- What sections it contains
- What components appear and when (e.g., empty state vs populated)
- What actions can be taken (e.g., tap to edit, long press, swipe)
- Conditional states (loading, error, completed)

Example:

```md
**Intentions Screen**
- Shows list of past intentions (Card)
- Each intention: Tag, Summary, Rating Progress Bar
- Tapping → expands detail modal
- Button to add new intention (FAB)
```

---

## 5. ⚙️ Feature/Flow-Level Requirements

Define interaction logic and animations for:

- Toast messages: when and what types (success/error/info)
- Expand/collapse cards
- Modal opening/closing behavior
- Navigation transitions (slide, fade, pop)

---

## 6. 📁 Folder Structure (Optional but Helpful)

If you know how you want files structured:

```
/components
  /Buttons
  /Cards
  /Inputs
  /Modals
/screens
  /Home
  /Intentions
  /TripDetails
/lib
  /theme
  /animations
  /utils
```

---

## 7. 🧑‍💻 Final: Ask Cursor to Do This

Once all above is gathered and clearly labeled:

Ask Cursor something like:

> Using this UI Overhaul Plan + my component inventory and design tokens, please build a reusable UI system using NativeWind + Tailwind config for React Native (Expo). Start by creating a theming system and all core components: Button, Card, Modal, Input, Toast. Then begin applying them screen by screen: Home → Timeline → Intentions → Trip Details…

---

## 📜 Checklist to Get Started:

| Task                        | Description                                  | Status |
| --------------------------- | -------------------------------------------- | ------ |
| 🎨 Color & Typography Spec  | Provide exact values or style guide          | ⬜      |
| 📏 Spacing, Radius, Shadows | Define or describe visually                  | ⬜      |
| 🧱 Component Examples       | Screenshots or sketches for key components   | ⬜      |
| 📱 Screen Descriptions      | What each screen contains, key actions       | ⬜      |
| 🎮 Animation Descriptions   | When/how UI animates (modals, cards, toasts) | ⬜      |
| 🧪 Token File               | Optional, but helpful if pre-defined         | ⬜      |
| 📂 Folder Structure         | Optional, for codebase clarity               | ⬜      |

