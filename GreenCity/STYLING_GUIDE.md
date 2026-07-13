# GreenCity Styling System Guide

## Overview
This document outlines the professional styling system used throughout the GreenCity mobile app. The app has been refactored from Tailwind CSS (via nativewind) to a comprehensive, maintainable React Native styling system using `StyleSheet.create()` and a centralized theme.

## Directory Structure
```
src/
├── styles/
│   ├── theme.ts           # Centralized color, spacing, and typography tokens
│   └── commonStyles.ts    # Reusable StyleSheet definitions
├── components/
│   ├── auth/              # Authentication components
│   └── community/         # Community-related components
└── ...other directories
```

## Core Files

### 1. `src/styles/theme.ts`
Centralized theme configuration containing:
- **Colors**: Primary green palette, neutrals, semantic colors, backgrounds
- **Spacing**: Consistent 8px-based spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
- **BorderRadius**: Standard border radius sizes (sm, md, lg, xl, 2xl, 3xl, full)
- **FontSizes**: Typography scale (xs through 4xl)
- **FontWeights**: Standard weights (normal, medium, semibold, bold, extrabold)
- **LineHeights**: Text line heights for different purposes
- **Shadows**: Elevation-based shadow definitions

### 2. `src/styles/commonStyles.ts`
Pre-built StyleSheet for common patterns:
- Flexbox utilities (flex, flexCenter, flexRow, flexRowBetween, etc.)
- Typography styles (headings, body text, labels)
- Container styles (card, modal, screen containers)
- Input and button base styles
- Dividers and badges

## Usage Guidelines

### Importing and Using Styles

```tsx
import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../styles/theme';
import { CommonStyles } from '../styles/commonStyles';

// Define component-specific styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  heading: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.primary[900],
  },
});

export function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Hello</Text>
    </View>
  );
}
```

## Color Palette

### Primary Colors
- **Primary 50**: `#f0fdf4` - Lightest background
- **Primary 100**: `#dcfce7` - Light accent
- **Primary 500**: `#16a34a` - Main brand color
- **Primary 900**: `#14532d` - Darkest (text)

### Neutral Colors
- **0**: `#ffffff` - White
- **50-900**: Gray scale from lightest to darkest
- **900**: `#111827` - Black

### Semantic Colors
- **Success**: `#10b981`
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444`
- **Info**: `#3b82f6`

## Spacing System

Consistent 8px-based spacing:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 40px
- `3xl`: 48px

## Typography

### Font Weights
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 900

### Font Sizes
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px
- 2xl: 24px
- 3xl: 30px
- 4xl: 36px

## Component Styling Examples

### Buttons
```tsx
const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary[500],
    ...Shadows.lg,
  },
  buttonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.neutral[0],
  },
});
```

### Input Fields
```tsx
const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.primary[100],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.primary[900],
  },
});
```

### Cards
```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.md,
  },
});
```

### Modals
```tsx
const styles = StyleSheet.create({
  modalSheet: {
    backgroundColor: Colors.backgroundAlt,
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
});
```

## Best Practices

1. **Use Theme Tokens**: Always use values from `theme.ts` instead of hardcoding colors or spacing
2. **Consistent Spacing**: Use the spacing scale for consistent margins and padding
3. **Component-Scoped Styles**: Define styles within component files using `StyleSheet.create()`
4. **Reuse Common Styles**: Use CommonStyles for repeated patterns
5. **Semantic Naming**: Use clear, semantic names for style objects
6. **Comments**: Document complex style logic with comments
7. **Flexibility**: Pass style props to components for customization when needed

## Responsive Design

For responsive layouts in React Native:
```tsx
import { useWindowDimensions } from 'react-native';

export function ResponsiveComponent() {
  const { width } = useWindowDimensions();
  const isMobile = width < 480;
  
  return (
    <View style={[styles.container, isMobile && styles.mobileContainer]}>
      {/* Content */}
    </View>
  );
}
```

## Accessibility

- Ensure sufficient color contrast (WCAG AA standard)
- Use appropriate font sizes for readability
- Provide clear touch targets (min 48x48dp)
- Use semantic color meanings (error = red, success = green)

## Migration Notes

### Before (Tailwind)
```tsx
<View className="flex-1 bg-primary p-6 rounded-2xl">
  <Text className="text-white font-bold text-lg">Button</Text>
</View>
```

### After (StyleSheet)
```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary[500],
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  text: {
    color: Colors.neutral[0],
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.lg,
  },
});

<View style={styles.container}>
  <Text style={styles.text}>Button</Text>
</View>
```

## Performance Notes

- `StyleSheet.create()` creates optimized style objects
- Use style composition: `[baseStyle, conditionalStyle]` for multiple styles
- Avoid creating styles inline in render functions
- Memoize components with multiple styles using `React.memo`

## Future Enhancements

- Consider adding dark mode support with theme context
- Add responsive breakpoints helper function
- Create additional utility style combinations
- Consider animation presets for common transitions
