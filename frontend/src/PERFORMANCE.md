# Verixa Frontend Performance Guidelines & Architecture Conventions

This document outlines the core frontend performance principles and guidelines established for the Verixa application.

---

## 1. Code Splitting & Lazy Loading

- **Route-Based Lazy Loading**: Every feature module page component MUST be lazy-loaded using `React.lazy()` inside `app/router/AppRoutes.jsx`.
- **Feature Isolation**: Never import code directly across unrelated feature boundaries unless it belongs in `src/shared/`.
- **Suspense Fallbacks**: Always wrap lazy components inside `AppSuspense` with an appropriate skeleton loader (`PageSkeleton`, `CardSkeleton`, `TableSkeleton`, `ListSkeleton`).

---

## 2. Rendering & Optimization Guidelines

- **Selective `React.memo`**:
  - Do NOT wrap every component in `React.memo()` by default.
  - Only apply `React.memo()` when profiling (via React DevTools Profiler) confirms a heavy component re-renders frequently with unchanged props.
- **Judicious `useMemo`**:
  - Reserve `useMemo()` for genuinely expensive computations (e.g., sorting/filtering large data lists or parsing complex geospatial data).
  - Primitive operations or small array transformations do not require `useMemo()`.
- **Targeted `useCallback`**:
  - Use `useCallback()` primarily when passing function references to memoized child components (`React.memo`) or as dependencies in `useEffect`.
- **State Localization**:
  - Keep state as local as possible. Do NOT push component-specific state up into global contexts or state stores.
  - Lift state only when multiple distant components strictly require synchronized access.

---

## 3. Skeleton & Loading Strategy

- Always prefer non-layout-shifting Skeletons (`src/shared/components/skeletons/`) over generic blank screens during data fetching.
- Keep loading indicators responsive and theme-consistent (dark panel glassmorphism).

---

## 4. Virtualization Protocol for Large Lists

- Long lists (e.g., property searches, builder directories) MUST utilize the `VirtualList` container adapter (`src/shared/components/virtual/VirtualList.jsx`) to keep DOM node counts low when rendering items exceeding 50 records.

---

## 5. Error Containment & Resilience

- All route components are guarded by the global `ErrorBoundary` (`src/shared/components/ErrorBoundary.jsx`).
- Feature components should handle fallback error states gracefully without crashing adjacent UI trees.
