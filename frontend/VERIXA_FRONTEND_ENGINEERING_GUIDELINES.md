# Verixa Frontend Engineering Guidelines (V1)

## 1. Objective

The goal is to build a scalable, modular, maintainable, and production-ready frontend using a Feature-First Architecture.

Every developer should follow these standards to ensure consistency, code quality, and long-term scalability.

---

## 2. Architecture

We follow Feature-First Architecture.

```text
src/
├── app/
├── assets/
├── features/
└── shared/
```

### Rules
- Business logic belongs inside the feature.
- Shared code belongs in `shared/`.
- App-level configuration belongs in `app/`.
- Never mix feature-specific code into shared folders.

---

## 3. Folder Rules

Each feature should follow the same structure.

### Example:
```text
features/
└── properties/
    ├── components/
    ├── pages/
    ├── services/
    ├── hooks/
    ├── utils/
    └── constants/
```

### Rules:
- **Pages** → Complete screens
- **Components** → UI for that feature
- **Services** → API calls
- **Hooks** → Custom hooks
- **Utils** → Helper functions
- **Constants** → Static values

---

## 4. Component Rules

Always create:
- Small
- Reusable
- Single Responsibility Components

If a component is used in multiple features:
`shared/components`

Otherwise:
`features/<feature>/components`

**Never duplicate components.**

---

## 5. Routing

Every feature must use route-based lazy loading.

`Landing` → `Properties` → `Builders` → `Dashboard`

Keep routes modular.

Use:
- `PublicRoute`
- `GuestRoute`
- `ProtectedRoute`

---

## 6. Layout Rules

Only three layouts are allowed.
- `MainLayout`
- `AuthLayout`
- `DashboardLayout`

**Never create unnecessary layouts.**

---

## 7. API Rules

Never call Axios directly inside components.

Always follow:
`Component` → `Service` → `Axios`

One feature should have one service.

---

## 8. Performance Rules

Every new feature must follow:
- ✅ Route Lazy Loading
- ✅ Suspense
- ✅ Skeleton Loading
- ✅ Error Boundary

Avoid unnecessary re-renders. Keep state as local as possible. Do not optimize prematurely.

---

## 9. UI Rules

Every page must support:
- Loading State
- Error State
- Empty State
- Responsive Design

Keep UI consistent. Reuse shared components whenever possible.

---

## 10. Coding Standards

Follow:
- Clean Code
- Meaningful Naming
- Small Components
- Reusable Logic
- No Duplicate Code
- Proper Folder Organization

Always separate:
`UI` → `Business Logic` → `API`

---

## 11. Code Review Checklist

Before pushing code, verify:
- [ ] Feature follows folder structure.
- [ ] No duplicate components.
- [ ] APIs are inside services.
- [ ] Route uses lazy loading.
- [ ] Loading state exists.
- [ ] Error state exists.
- [ ] Responsive on desktop, tablet, and mobile.
- [ ] No unnecessary `console.log`.
- [ ] Imports are clean.
- [ ] Project builds without warnings or errors.

---

## 12. Golden Rules

1. Follow Feature-First Architecture.
2. Never duplicate code.
3. Keep components reusable.
4. Keep business logic separate from UI.
5. Never call APIs directly inside components.
6. Every page must support Loading, Error, and Empty states.
7. Use Lazy Loading for every major route.
8. Use shared components whenever possible.
9. Write code that another developer can easily understand.
10. Keep the codebase scalable, maintainable, and production-ready.

---

## 🎯 Final Principle

> **Build once, reuse everywhere.** Keep every feature independent, every component reusable, and every page production-ready from day one.
