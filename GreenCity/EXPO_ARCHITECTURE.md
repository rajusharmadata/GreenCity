# GreenCity Expo App Architecture

## Overview

This Expo React Native app follows enterprise-grade architecture patterns with clear separation of concerns, reusable components, and scalable structure.

## Folder Structure

```
GreenCity/
├── app/                      # Expo Router file-based routing
│   ├── (auth)/              # Authentication screens group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── verify-email.tsx
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── report.tsx
│   │   ├── eco-routes.tsx
│   │   ├── community.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx          # Root layout with Toast
│   ├── index.tsx            # Index screen
│   ├── badges.tsx           # Badges modal
│   ├── eco-route-map.tsx     # Eco route map modal
│   ├── leaderboard.tsx      # Leaderboard modal
│   └── report-detail.tsx    # Report detail modal
│
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI component library
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts
│   │   ├── auth/           # Auth-specific components
│   │   │   ├── AuthContainer.tsx
│   │   │   ├── AuthInput.tsx
│   │   │   └── ButtonWithLoader.tsx
│   │   ├── community/      # Community components
│   │   │   ├── CommentModal.tsx
│   │   │   └── CreatePostModal.tsx
│   │   ├── CameraCapture.tsx
│   │   └── PermissionHandler.tsx
│   │
│   ├── screens/            # Screen components (if not using file-based routing)
│   │   ├── badges.tsx
│   │   ├── community.tsx
│   │   ├── dashboard.tsx
│   │   ├── eco-route-map.tsx
│   │   ├── eco-routes.tsx
│   │   ├── index.tsx
│   │   ├── leaderboard.tsx
│   │   ├── login.tsx
│   │   ├── profile.tsx
│   │   ├── register.tsx
│   │   ├── report-detail.tsx
│   │   ├── report.tsx
│   │   └── verify-email.tsx
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── api/
│   │   │   └── useApi.ts
│   │   ├── usePoints.ts
│   │   └── useCamera.ts
│   │
│   ├── navigation/         # Navigation configuration
│   │   └── types.ts
│   │
│   ├── services/           # API services
│   │   ├── routeService.ts
│   │   └── reportService.ts
│   │
│   ├── store/              # State management (Zustand)
│   │   ├── authStore.ts
│   │   └── ecoRouteStore.ts
│   │
│   ├── styles/             # Styling
│   │   ├── theme.ts
│   │   └── commonStyles.ts
│   │
│   ├── theme/              # Theme configuration
│   │   └── index.ts
│   │
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   │
│   ├── utils/              # Utility functions
│   │   └── helpers.ts
│   │
│   └── constants/          # App constants
│       └── app.ts
│
├── assets/                 # Static assets
│   └── images/
│
├── config/                 # Configuration files
│   ├── babel.config.js
│   ├── metro.config.js
│   └── eas.json
│
├── .env                    # Environment variables
├── .gitignore
├── .prettierrc
├── app.json
├── app.json.js
├── eas.json
├── eslint.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture Principles

### 1. Component Organization

- **UI Components**: Reusable, presentational components in `src/components/ui/`
- **Feature Components**: Domain-specific components in subdirectories
- **Screens**: Page-level components using Expo Router file-based routing
- **Layout Components**: Wrapper components for navigation and structure

### 2. State Management

- **Zustand** for global state (auth, eco-routes)
- **React Context** for theme and navigation
- **Local State** for component-specific state

### 3. API Layer

- **useApi Hook**: Centralized API request handling
- **Service Layer**: Domain-specific API calls
- **Error Handling**: Centralized error handling with toast notifications
- **Type Safety**: TypeScript interfaces for API responses

### 4. Styling System

- **Theme**: Centralized design tokens (colors, spacing, typography)
- **Common Styles**: Reusable StyleSheet definitions
- **Component Styles**: Component-specific styles using theme tokens
- **Responsive**: Adaptive layouts for different screen sizes

### 5. Navigation

- **Expo Router**: File-based routing for type-safe navigation
- **Tab Navigation**: Bottom tab navigation for main features
- **Stack Navigation**: Modal navigation for detail screens
- **Type Safety**: Navigation types defined in `src/navigation/types.ts`

## UI Component Library

### Available Components

#### Button
```typescript
import { Button } from '@/src/components/ui';

<Button
  title="Submit"
  variant="primary"
  size="medium"
  loading={false}
  onPress={() => {}}
/>
```

**Variants**: primary, secondary, ghost, danger
**Sizes**: small, medium, large

#### Card
```typescript
import { Card } from '@/src/components/ui';

<Card variant="elevated" padding="large">
  <Text>Card content</Text>
</Card>
```

**Variants**: default, elevated, outlined
**Padding**: none, small, medium, large

#### Input
```typescript
import { Input } from '@/src/components/ui';

<Input
  label="Email"
  placeholder="Enter your email"
  error={errorMessage}
  onChangeText={(text) => {}}
/>
```

#### Badge
```typescript
import { Badge } from '@/src/components/ui';

<Badge text="Active" variant="success" size="medium" />
```

**Variants**: success, warning, error, info, default
**Sizes**: small, medium, large

#### Avatar
```typescript
import { Avatar } from '@/src/components/ui';

<Avatar uri="https://..." size="large" />
<Avatar name="John Doe" size="medium" />
```

**Sizes**: small, medium, large, xlarge

#### LoadingSpinner
```typescript
import { LoadingSpinner } from '@/src/components/ui';

<LoadingSpinner visible={true} />
```

#### EmptyState
```typescript
import { EmptyState } from '@/src/components/ui';

<EmptyState
  icon="leaf-outline"
  title="No reports yet"
  description="Start by reporting an issue in your area"
  action={<Button title="Create Report" />}
/>
```

#### Toast Notifications
```typescript
import { showSuccessToast, showErrorToast } from '@/src/components/ui';

showSuccessToast('Operation successful!');
showErrorToast('Something went wrong');
```

**Types**: success, error, info, warning

#### Modal
```typescript
import { CustomModal } from '@/src/components/ui';

<CustomModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  title="Modal Title"
>
  <Text>Modal content</Text>
</CustomModal>
```

#### Skeleton Loading
```typescript
import { Skeleton, SkeletonText, SkeletonCard, SkeletonList } from '@/src/components/ui';

<Skeleton width={100} height={20} />
<SkeletonText lines={3} />
<SkeletonCard />
<SkeletonList count={5} />
```

#### Progress Bar
```typescript
import { ProgressBar, StepProgress } from '@/src/components/ui';

<ProgressBar progress={75} showLabel />
<StepProgress
  steps={[
    { label: 'Step 1', completed: true },
    { label: 'Step 2', completed: false },
  ]}
  currentStep={1}
/>
```

#### Chip Selection
```typescript
import { Chip, ChipGroup } from '@/src/components/ui';

<Chip label="Tag" selected onSelect={() => {}} />
<ChipGroup
  chips={['Option 1', 'Option 2', 'Option 3']}
  selectedChips={['Option 1']}
  onToggle={(chip) => {}}
/>
```

#### Segmented Control
```typescript
import { SegmentedControl } from '@/src/components/ui';

<SegmentedControl
  segments={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
  ]}
  selectedSegment="day"
  onSegmentChange={(value) => {}}
/>
```

## Error Handling

### Error Display Components
```typescript
import { ErrorDisplay, InlineError, ErrorCard } from '@/src/components/ui';

// Full error display with retry
<ErrorDisplay
  error={appError}
  onRetry={() => refetch()}
  onDismiss={() => setError(null)}
  showDetails={true}
/>

// Inline error for form fields
<InlineError error={errorMessage} visible={hasError} />

// Error card for full-page errors
<ErrorCard
  title="Connection Error"
  message="Unable to connect to the server"
  action={<Button title="Retry" onPress={handleRetry} />}
/>
```

### Error Utilities
```typescript
import {
  parseApiError,
  getUserFriendlyMessage,
  isRecoverableError,
  isAuthError,
  logError,
  createError,
  getErrorSeverity,
} from '@/src/utils/errorHandler';

// Parse API error
const error = parseApiError(apiErrorObject);

// Get user-friendly message
const message = getUserFriendlyMessage(error);

// Check if error is recoverable
if (isRecoverableError(error)) {
  // Show retry button
}

// Check if auth error
if (isAuthError(error)) {
  // Redirect to login
}

// Log error for debugging
logError(error, 'Context string');

// Create custom error
const customError = createError('Custom message', 'ERROR_CODE', 400);

// Get error severity
const severity = getErrorSeverity(error); // 'low' | 'medium' | 'high'
```

### Error Toast Integration
```typescript
import {
  showErrorToast,
  showNetworkErrorToast,
  showServerErrorToast,
  showAuthErrorToast,
  showValidationErrorToast,
  showRateLimitErrorToast,
} from '@/src/utils/errorToast';

// Show error with severity-based styling
showErrorToast(appError);

// Show specific error types
showNetworkErrorToast();
showServerErrorToast();
showAuthErrorToast();
showValidationErrorToast('Invalid email format');
showRateLimitErrorToast();
```

### Error Boundary
```typescript
import { ErrorBoundary } from '@/src/components/ErrorBoundary';

<ErrorBoundary onError={(error, errorInfo) => {
  // Log error to error tracking service
  console.error('Error caught:', error, errorInfo);
}}>
  <YourApp />
</ErrorBoundary>
```

### Enhanced useApi Hook
```typescript
import { useApi } from '@/src/hooks/api/useApi';

const { get, post, loading, error, clearError } = useApi();

// API call with automatic error handling
const data = await get('/endpoint', {
  showToast: true,
  successMessage: 'Data loaded successfully',
});

// Skip error handling for manual error display
const data = await get('/endpoint', {
  skipErrorHandling: true,
});

// Clear error state
clearError();

// Access error object
if (error) {
  console.log(error.code, error.message, error.status);
}
```

## API Integration

### useApi Hook
```typescript
import { useApi } from '@/src/hooks/api/useApi';

const { get, post, put, patch, delete, loading, error } = useApi();

// GET request
const data = await get('/endpoint', { showToast: true });

// POST request
const result = await post('/endpoint', body, { 
  showToast: true,
  successMessage: 'Created successfully!'
});
```

### Service Layer
```typescript
// src/services/reportService.ts
import { useApi } from '@/src/hooks/api/useApi';

export const useReportService = () => {
  const { get, post } = useApi();

  const submitReport = async (reportData: any) => {
    return post('/reports', reportData, {
      successMessage: 'Report submitted successfully!'
    });
  };

  const getReports = async () => {
    return get('/reports');
  };

  return { submitReport, getReports };
};
```

## State Management

### Auth Store
```typescript
import { useAuthStore } from '@/src/store/authStore';

const { user, token, setUser, updatePoints, logout } = useAuthStore();
```

### EcoRoute Store
```typescript
import { useEcoRouteStore } from '@/src/store/ecoRouteStore';

const { routes, currentRoute, setRoutes, setCurrentRoute } = useEcoRouteStore();
```

## Utility Functions

### Helpers
```typescript
import {
  formatPoints,
  getTierFromPoints,
  formatDate,
  truncateText,
  validateEmail,
  validatePassword,
} from '@/src/utils/helpers';

// Format points with k suffix
formatPoints(1500); // "1.5k"

// Get user tier from points
getTierFromPoints(500); // "Gold"

// Format date relative to now
formatDate('2024-01-01'); // "Jan 1" or "2d ago"

// Truncate long text
truncateText('Long text...', 20); // "Long text..."

// Validate email
validateEmail('test@example.com'); // true

// Validate password
validatePassword('Password123'); // { valid: true }
```

### Form Validation
```typescript
import { useFormValidation } from '@/src/hooks/useFormValidation';
import { validateEmail, validatePassword, validateName } from '@/src/utils/validators';

const {
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  isValid,
  isSubmitting,
} = useFormValidation({
  initialValues: { email: '', password: '', name: '' },
  validationRules: {
    email: validateEmail,
    password: validatePassword,
    name: validateName,
  },
  onSubmit: async (values) => {
    // Submit form
  },
});
```

### Validation Functions
```typescript
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateUrl,
  validateNumber,
  validateMinLength,
  validateMaxLength,
  validateMatch,
  validateDate,
  validateAge,
  validateFile,
  getPasswordStrength,
} from '@/src/utils/validators';

// Email validation
validateEmail('test@example.com'); // { valid: true }

// Password validation
validatePassword('Password123'); // { valid: true }

// Name validation
validateName('John Doe'); // { valid: true }

// Phone validation
validatePhone('+1234567890'); // { valid: true }

// URL validation
validateUrl('https://example.com'); // { valid: true }

// Number validation
validateNumber(42, 0, 100); // { valid: true }

// Length validation
validateMinLength('text', 3); // { valid: true }
validateMaxLength('text', 10); // { valid: true }

// Match validation
validateMatch('password', 'password', 'Password'); // { valid: true }

// Date validation
validateDate('2024-01-01'); // { valid: true }

// Age validation
validateAge('2000-01-01', 13); // { valid: true }

// File validation
validateFile(file, 5 * 1024 * 1024, ['image/jpeg']); // { valid: true }

// Password strength
getPasswordStrength('Password123'); // { strength: 'medium', score: 4, feedback: 'Medium strength' }
```

## Constants

### App Constants
```typescript
import {
  API_BASE_URL,
  SCREEN_NAMES,
  STORAGE_KEYS,
  POINTS,
  TIER_THRESHOLDS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@/src/constants/app';
```

## Styling

### Theme Usage
```typescript
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/src/styles/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
});
```

### Common Styles
```typescript
import { CommonStyles } from '@/src/styles/commonStyles';

<View style={CommonStyles.screenContainer}>
  <Text style={CommonStyles.headingLarge}>Title</Text>
</View>
```

## Best Practices

### Component Development
1. **Keep components small and focused**
2. **Use TypeScript for type safety**
3. **Follow the existing naming conventions**
4. **Use theme tokens for styling**
5. **Add proper error handling**

### API Integration
1. **Use the useApi hook for all API calls**
2. **Handle loading and error states**
3. **Show appropriate toast notifications**
4. **Validate data before sending**

### State Management
1. **Use Zustand for global state**
2. **Keep local state in components**
3. **Avoid prop drilling**
4. **Use selectors for derived state**

### Navigation
1. **Use Expo Router file-based routing**
2. **Define navigation types**
3. **Pass required params**
4. **Handle deep linking**

## Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the App

### Development
```bash
npm start
```

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web
```bash
npm run web
```

## Installation

Install dependencies:
```bash
npm install
```

Note: The `react-native-toast-message` package was added for toast notifications. Make sure to install it:

```bash
npm install react-native-toast-message
```

## Contributing

When adding new features:

1. **Create UI components** in `src/components/ui/`
2. **Add screen routes** in `app/` directory
3. **Create service functions** in `src/services/`
4. **Add types** in `src/types/` or `src/navigation/types.ts`
5. **Update constants** in `src/constants/app.ts`
6. **Add utility functions** in `src/utils/helpers.ts`
7. **Update this documentation**

## TypeScript Configuration

The app uses TypeScript for type safety. Key configurations:

- **Strict mode enabled**
- **Path aliases** configured in `tsconfig.json`
- **React Native types** included
- **Expo Router types** for navigation

## Performance Optimization

1. **Use React.memo** for expensive components
2. **Implement virtual lists** for long lists
3. **Optimize images** with proper sizing
4. **Use useCallback/useMemo** appropriately
5. **Lazy load screens** when needed

## Security

1. **Store tokens securely** with Expo SecureStore
2. **Validate all inputs** before sending to API
3. **Use HTTPS** in production
4. **Sanitize user-generated content**
5. **Implement proper authentication**

## Testing

Recommended testing approach:

- **Unit tests** for utilities and hooks
- **Component tests** for UI components
- **Integration tests** for API calls
- **E2E tests** for critical user flows

## Deployment

### EAS Build
```bash
eas build --platform ios
eas build --platform android
```

### EAS Submit
```bash
eas submit --platform ios
eas submit --platform android
```

## Troubleshooting

### Common Issues

1. **Toast not showing**: Ensure `<Toast />` is in root layout
2. **Navigation errors**: Check navigation types and params
3. **API errors**: Verify API_BASE_URL and network connection
4. **Styling issues**: Check theme imports and token usage
5. **Type errors**: Run TypeScript compiler to identify issues

## Maintenance

- **Regular dependency updates**
- **Code reviews**
- **Performance monitoring**
- **Error log analysis**
- **User feedback integration**
