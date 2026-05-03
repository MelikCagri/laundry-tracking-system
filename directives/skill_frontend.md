# Frontend Development Directive (SOP and Style Guide)

This document defines the strict standard operating procedures (SOP) and style guide for the frontend development of the KYK Laundry Tracking System. All frontend code must strictly adhere to these rules.

## 1. Core Technologies
- **Framework/Build Tool:** React 18+ and Vite
- **Language:** TypeScript (`.tsx`, `.ts`)
- **Styling:** Tailwind CSS

## 2. Directory and File Architecture
The following directory hierarchy will be used for a modular and clean structure within the project:

```text
src/
├── assets/        # Images, icons, fonts
├── components/    # Reusable UI components (Button, Card, Modal, etc.)
│   ├── common/    # Project-wide common components
│   └── feature/   # Feature-specific components (e.g., MachineCard)
├── hooks/         # Custom React hooks (useAuth, useMachines, etc.)
├── pages/         # Page components (Home, Login, Dashboard, etc.)
├── services/      # API calls and external service integrations
├── store/         # Global state management (Context API or Zustand)
├── types/         # TypeScript interfaces and type definitions
└── utils/         # Helper functions (date formatting, color determination, etc.)
```

## 3. Component Architecture
- Only **Functional Components** will be used. Class components are strictly prohibited.
- Each component must focus on a single task (Single Responsibility Principle).
- Component names must be in **PascalCase** (e.g., `MachineCard.tsx`).
- Folder structure: Large components can be kept in their own folders as `index.tsx`, `Component.tsx`, and `Component.test.tsx` if applicable.

## 4. TypeScript Rules
- `strict: true` mode in `tsconfig.json` must remain enabled at all times.
- The use of the `any` type is **strictly prohibited**. When necessary, use `unknown` and perform type narrowing.
- Database models (`Users`, `Machines`, `Logs`) must be fully defined under `src/types/index.ts`.
- `interface` or `type` must be used for Props definitions and they must be exported.

Example:
```typescript
export interface MachineProps {
  id: string;
  type: 'Laundry' | 'Dryer';
  status: 'Empty' | 'Full' | 'Finished';
  floorNumber: number;
  endTime?: Date;
}
```

## 5. Tailwind CSS and Style Guide
- No custom CSS will be written; all styling will be applied using Tailwind utility classes.
- Complex or highly repetitive Tailwind classes should be combined using `@apply` or a helper function (e.g., `clsx` or `tailwind-merge`).
- **Color Palette:** To show the current status of the machines, fixed color codes matching `spec.md` must be used:
  - Empty: Green shades (e.g., `bg-green-500`)
  - Full: Red shades (e.g., `bg-red-500`)
  - Finished: Yellow/Orange shades (e.g., `bg-yellow-500`)
- Because the system will be used on students' mobile devices, a **Mobile-First** approach is mandatory.

## 6. State Management
- Use `useState` for local states and `useReducer` for complex local logic.
- SWR or React Query is recommended for server data and caching (or custom `useFetch` hooks).
- Application-wide states (active user session, selected floor number, etc.) should be managed with React Context.

## 7. User Experience (UX) and Performance
- Feedback must always be provided to the user during every API call (Loading spinner, Skeleton).
- Operation results (success/error) must be shown with Toast messages.
- Confirmation Modals must be used for actions where users change machine statuses to prevent accidental clicks.
- Code-splitting with `React.lazy` should be used to speed up page transitions.

## 8. Security and Error Handling
- Errors must be caught with Error Boundaries; a White Screen of Death must not be shown.
- All user inputs (especially left notes) must be sanitized on the frontend before displaying (XSS prevention).
