# GreenCity Mobile App - Project Structure

## 📁 Directory Layout

```
mobile/
├── app/                           # Expo Router navigation structure (DO NOT MOVE)
│   ├── (auth)/                   # Authentication routes group
│   ├── (tabs)/                   # Tab-based routes group
│   ├── _layout.tsx               # Root layout configuration
│   └── *.tsx                      # Screen components that use Expo Router
│
├── src/                          # Source code - organized by feature/type
│   ├── components/               # Reusable React components
│   │   ├── auth/                 # Authentication-specific components
│   │   ├── community/            # Community feature components
│   │   └── *.tsx                 # Standalone components
│   │
│   ├── screens/                  # Screen components (referenced in app/)
│   │   └── *.tsx                 # Individual screen implementations
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useLocation.ts        # Location-related hook
│   │   ├── useCamera.ts          # Camera-related hook
│   │   └── *.ts                  # Other custom hooks
│   │
│   ├── services/                 # API services and integrations
│   │   ├── reportService.ts      # Issue reporting API calls
│   │   ├── routeService.ts       # Route/transport API calls
│   │   └── *.ts                  # Other service integrations
│   │
│   ├── store/                    # State management (Zustand)
│   │   └── *.ts                  # Store files
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── *.ts                  # Type files (e.g., community.ts)
│   │
│   ├── utils/                    # Utility functions
│   │   ├── api.ts                # API configuration and helpers
│   │   ├── permissions.ts        # Permission-related utilities
│   │   └── *.ts                  # Other utilities
│   │
│   ├── theme/                    # Design tokens and theming
│   │   ├── index.ts              # Theme configuration
│   │   ├── global.css            # Global styles
│   │   └── nativewind-env.d.ts   # NativeWind TypeScript definitions
│   │
│   └── constants/                # Application constants
│       └── *.ts                  # Constant definitions
│
├── config/                       # Configuration files
│   ├── babel.config.js           # Babel configuration
│   ├── metro.config.js           # Metro bundler configuration
│   ├── eas.json                  # EAS (Expo Application Services) config
│   └── tailwind.config.js        # Tailwind CSS configuration
│
├── assets/                       # Static assets
│   └── images/                   # App icons, splash screens, etc.
│
├── app.json                      # Expo app configuration
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration with path aliases
├── eslint.config.js              # ESLint configuration
└── README.md                      # App documentation
```

## 🎯 Path Aliases

You can use TypeScript path aliases for cleaner imports:

```typescript
// Instead of:
import { MyComponent } from '../../../src/components/MyComponent';

// Use:
import { MyComponent } from '@components/MyComponent';
```

**Available aliases:**
- `@components/*` → `src/components/*`
- `@hooks/*` → `src/hooks/*`
- `@services/*` → `src/services/*`
- `@store/*` → `src/store/*`
- `@theme/*` → `src/theme/*`
- `@types/*` → `src/types/*`
- `@utils/*` → `src/utils/*`
- `@screens/*` → `src/screens/*`
- `@constants/*` → `src/constants/*`

## 🚀 Running the App

```bash
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Lint code
npm run lint
```

## 📝 Key Points

1. **app/ directory** is for Expo Router routes and MUST stay at the project root
2. **src/** contains all reusable code organized by type/feature
3. **config/** contains all configuration files separated from root
4. **assets/** contains all static resources
5. Use path aliases for cleaner, more maintainable imports

## 🏗️ Adding New Features

When adding a new feature:

1. Create a folder in `src/components/` for feature-specific components
2. Add feature-specific hooks in `src/hooks/` (or in a feature folder)
3. Create API service file in `src/services/`
4. Add types in `src/types/`
5. Create route files in `app/` that import from `src/screens/`

Example structure for a "notifications" feature:
```
src/
├── components/notifications/
│   ├── NotificationCard.tsx
│   └── NotificationList.tsx
├── hooks/useNotifications.ts
├── services/notificationService.ts
└── types/notification.ts
```

## 📚 App Name: GreenCity

The app has been renamed from "Mobile" to "GreenCity":
- `app.json`: `name: "GreenCity"`, `slug: "greencity"`
- `package.json`: `name: "greencity"`
- Android package: `com.rajusharmadata.greencity`
- Scheme: `greencity://`
