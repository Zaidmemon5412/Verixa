# Verixa Frontend Architecture & Performance Quick-Start Guide

Ye document Verixa frontend ke pure architecture, folder structure, layouts, aur performance setup ko simple words me explain karta hai taaki koi bhi naya developer padhte hi sab samajh jaye.

---

## 1. Directory Architecture (Feature-First Pattern)

Pura project **Feature-First Architecture** follow karta hai. Folder structure niche explain kiya gaya hai:

```text
src/
├── app/                  # Application Core (Routing, Layouts, Providers)
│   ├── layouts/          # Reusable Page Layout Wrappers (Main, Auth, Dashboard)
│   ├── providers/        # Global State Contexts (AuthContext)
│   └── router/           # Central Route Mapping (AppRoutes.jsx)
│
├── features/             # Business Feature Modules (Isolated & Modular)
│   ├── auth/             # Login, Register, Forgot Password, Reset Password
│   ├── landing/          # Homepage & Hero Shell
│   ├── properties/       # Property Search, List & Detail Shells
│   ├── builders/         # Builder Profiles & Registry Shells
│   ├── dashboard/        # Main Analytics Dashboard
│   ├── comparison/       # Property Comparison Decision Matrix
│   ├── profile/          # User Account & Profile Settings
│   └── reports/          # Audit Reports Archive
│
└── shared/               # Shared & Reusable Infrastructure
    ├── components/       # Common UI (Navbar, Footer, Sidebar, ErrorBoundary, Skeletons)
    ├── services/         # Axios API Client & Endpoints Configuration
    └── utils/            # Token Helpers & Error Formatter Utilities
```

---

## 2. Three Layout System (`src/app/layouts`)

App me **3 Reusable Layouts** use hote hain jo routes ko structural shape dete hain:

1. **`MainLayout`** (`Navbar` + `<Outlet />` + `Footer`):
   - **Kyu use hota hai?** Public exploration pages ke liye (Homepage `/`, `/properties`, `/builders`).
   - **Kaise kaam karta hai?** Page content beech me (`<Outlet />`) render hota hai, top me Navbar aur bottom me Footer fix rehte hain.

2. **`AuthLayout`** (Centered Glass Box + `<Outlet />`):
   - **Kyu use hota hai?** Login, Register, Forgot Password, Reset Password screen ke liye.
   - **Kaise kaam karta hai?** Page ko screen ke center me glassmorphic box ke andar render karta hai.

3. **`DashboardLayout`** (`Sidebar` + `DashboardHeader` + `<Outlet />`):
   - **Kyu use hota hai?** Logged-in user workspace ke liye (`/dashboard`, `/profile`, `/comparison`, `/reports`).
   - **Kaise kaam karta hai?** Left me collapsible Sidebar and top me Dashboard Header ke sath user workspace open rehta hai.

---

## 3. Route Protection & Security (`src/shared/components` & `features/auth/components`)

- **`ProtectedRoute`**: Faida -> Bina login kiye koi user `/dashboard`, `/profile` open nahi kar sakta. (Auto redirect to `/login`).
- **`PublicRoute`**: Faida -> Jo user already Logged-in hai, wo dubara `/login` ya `/register` page nahi khol sakta. (Auto redirect to `/dashboard`).

---

## 4. Performance Infrastructure

High speed, small bundle size aur fast page load ke liye 4 main techniques use ki gayi hain:

### ⚡ A. Route-Based Lazy Loading (`React.lazy`)
- **Kyu?** Pehle saari pages ek saath download hoti thi. Ab har page tabhi load hogi jab user us route par click karega.
- **Kahan setup hai?** `src/app/router/AppRoutes.jsx` me `lazy(() => import(...))` setup hai.

### 🛡️ B. Global Error Boundary (`ErrorBoundary.jsx`)
- **Kyu?** Agar kisi component me rendering error aaye, to puri application white screen crash nahi hogi.
- **Kahan setup hai?** `src/App.jsx` ko `<ErrorBoundary>` me wrap kiya gaya hai jo error hone par clean Fallback UI aur "Reload Page" button dikhata hai.

### 💀 C. Skeleton Loading System (`src/shared/components/skeletons`)
- **Kyu?** Slow internet par blank screen dikhane ki bajaye layout skeleton pulse animation dikhate hain taaki layout shift (CLS) na ho.
- **Components Available:** `PageSkeleton`, `CardSkeleton`, `ListSkeleton`, `TableSkeleton`.

### 📦 D. Vite Chunk Splitting (`vite.config.js`)
- **Kyu?** Third-party libraries (`react`, `axios`, `lucide-react`) ko isolated vendor bundles me separate kiya gaya hai taaki browser cache memory optimal rahe.

---

## 5. Quick Cheat-Sheet for New Developers

| Task / Want to add something? | Path / File to touch |
| :--- | :--- |
| **New Route add karna** | Edit `src/app/router/AppRoutes.jsx` (Use `React.lazy`) |
| **New Feature Module add karna** | Create folder under `src/features/your-feature-name/` |
| **Global Component add karna** | Place in `src/shared/components/` |
| **API Call ya Endpoint add karna** | Add endpoint to `src/shared/services/endpoints.js` & service call in `features/<name>/services/` |
