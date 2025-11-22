# GreenCity UI Components Library

A comprehensive, accessible, and performant React component library built for the GreenCity project. This library provides reusable UI components with consistent design, animations, and accessibility features.

## Features

- 🎨 **Modern Design**: Clean, consistent design system with TailwindCSS
- ♿ **Accessibility**: WCAG 2.1 compliant components with ARIA support
- ⚡ **Performance**: Optimized components with memoization and virtualization
- 📱 **Responsive**: Mobile-first responsive design patterns
- 🎭 **Animations**: Smooth transitions using Framer Motion
- 🔧 **Developer Experience**: TypeScript-friendly with comprehensive props

## Installation

All components are available in the `/src/components/ui/` directory. Import them from the main index file:

```javascript
import { Button, Card, Modal } from '../components/ui';
```

## Core Components

### Button
A versatile button component with multiple variants and states.

```javascript
import { Button } from '../components/ui';

<Button variant="default" size="md" loading={false}>
  Click me
</Button>
```

**Props:**
- `variant`: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `disabled`: boolean
- `ariaLabel`: string (accessibility)
- `onClick`: function

### Card
Flexible card component with sub-components.

```javascript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Modal
Accessible modal component with backdrop and animations.

```javascript
import { Modal } from '../components/ui';

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  <p>Modal content</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `closeOnBackdropClick`: boolean

### Badge
Small status indicators with variants.

```javascript
import { Badge } from '../components/ui';

<Badge variant="success" size="sm">Active</Badge>
```

## Form Components

### Form System
Comprehensive form validation and management.

```javascript
import { FormProvider, FormField, FormActions, useForm } from '../components/ui';

const MyForm = () => {
  const handleSubmit = async (values) => {
    console.log(values);
  };

  const validationSchema = {
    email: {
      required: true,
      email: true,
      requiredMessage: 'Email is required'
    },
    password: {
      required: true,
      minLength: 8,
      requiredMessage: 'Password is required'
    }
  };

  return (
    <FormProvider 
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      <FormField name="email" label="Email">
        <Input type="email" />
      </FormField>
      
      <FormField name="password" label="Password">
        <Input type="password" />
      </FormField>
      
      <FormActions>
        <Button type="submit">Submit</Button>
      </FormActions>
    </FormProvider>
  );
};
```

### Input, Select, Textarea
Enhanced form input components with validation support.

```javascript
import { Input, Select, Textarea } from '../components/ui';

<Input 
  label="Name" 
  placeholder="Enter your name"
  error={error}
  helperText="Please enter your full name"
/>

<Select 
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' }
  ]}
/>

<Textarea 
  label="Message"
  placeholder="Type your message here"
  rows={4}
/>
```

## Data Display Components

### DataTable
Feature-rich data table with sorting, pagination, and search.

```javascript
import { DataTable } from '../components/ui';

const columns = [
  {
    header: 'Name',
    accessor: 'name',
    sortable: true
  },
  {
    header: 'Status',
    accessor: 'status',
    badge: { variant: 'success' }
  }
];

<DataTable
  data={data}
  columns={columns}
  loading={loading}
  pagination={true}
  searchable={true}
  selectable={true}
  onRowClick={handleRowClick}
/>
```

### Progress
Visual progress indicators.

```javascript
import { Progress } from '../components/ui';

<Progress value={75} max={100} size="md" color="green" />
```

## Layout Components

### ResponsiveLayout
Mobile-first responsive layout system.

```javascript
import { ResponsiveLayout, Grid, Container, Flex } from '../components/ui';

<ResponsiveLayout 
  sidebar={<Sidebar />}
  header={<Header />}
  footer={<Footer />}
>
  <Container>
    <Grid cols={3} gap={4}>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </Grid>
  </Container>
</ResponsiveLayout>
```

## Loading States

### Comprehensive Loading Components
Various loading states for different contexts.

```javascript
import { 
  PageLoader, 
  CardSkeleton, 
  TableSkeleton, 
  ProgressiveLoader 
} from '../components/ui';

// Full page loader
<PageLoader message="Loading dashboard..." />

// Skeleton loaders
<CardSkeleton count={3} />
<TableSkeleton rows={5} columns={4} />

// Progressive loading
<ProgressiveLoader
  isLoading={loading}
  error={error}
  data={data}
  loadingComponent={<Spinner />}
  errorComponent={<ErrorComponent />}
  emptyComponent={<EmptyComponent />}
>
  <YourComponent />
</ProgressiveLoader>
```

## Accessibility

### Accessibility Components
WCAG 2.1 compliant components.

```javascript
import {
  SkipLink,
  AccessibleField,
  useKeyboardNavigation,
  useFocusTrap
} from '../components/ui';

// Skip link for keyboard navigation
<SkipLink href="#main-content">Skip to main content</SkipLink>

// Accessible form field
<AccessibleField 
  label="Email" 
  required 
  error={error}
  hint="Enter your email address"
>
  <Input type="email" />
</AccessibleField>

// Keyboard navigation
const { activeIndex, setActiveIndex } = useKeyboardNavigation(
  items,
  onSelect,
  { orientation: 'vertical', loop: true }
);
```

## Performance

### Performance Optimizations
Built-in performance optimizations.

```javascript
import {
  useDebounce,
  VirtualList,
  LazyImage,
  usePagination
} from '../components/ui';

// Debounced search
const debouncedSearch = useDebounce(searchTerm, 300);

// Virtual list for large datasets
<VirtualList
  items={largeData}
  itemHeight={40}
  containerHeight={400}
  renderItem={(item, index) => <div>{item.name}</div>}
/>

// Lazy loaded images
<LazyImage 
  src="/path/to/image.jpg"
  alt="Description"
  placeholder="/placeholder.jpg"
/>

// Optimized pagination
const { currentPage, totalPages, paginatedItems } = usePagination(
  items,
  10
);
```

## Toast Notifications

### Toast System
Global notification system.

```javascript
import { Toast } from '../components/ui';

// Usage through context
const { success, error, warning, info } = useNotification();

success('Operation completed successfully!');
error('Something went wrong');
warning('Please review your input');
info('New update available');
```

## Customization

### Theming
Components use TailwindCSS classes for easy customization. Modify your `tailwind.config.js` to customize colors, spacing, and more.

### Utility Functions
Access utility functions for common operations.

```javascript
import { cn } from '../components/ui';

// Class name merging
const className = cn('base-class', 'additional-class', condition && 'conditional-class');
```

## Best Practices

1. **Accessibility First**: Always include proper ARIA labels and keyboard navigation
2. **Performance**: Use memoization for expensive operations
3. **Responsive**: Design mobile-first and test on all screen sizes
4. **Consistency**: Use the provided variants and sizes for consistency
5. **Error Handling**: Always provide loading and error states

## Development

### Component Structure
Each component follows this structure:
- Component file with proper TypeScript types
- Comprehensive prop documentation
- Accessibility attributes
- Performance optimizations
- Responsive design

### Testing
Components are designed to be testable:
- Semantic HTML structure
- Proper ARIA attributes
- Predictable behavior
- Accessible via screen readers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When adding new components:
1. Follow the existing component structure
2. Include accessibility features
3. Add performance optimizations
4. Document all props
5. Include responsive design
6. Add examples to this README

## License

This component library is part of the GreenCity project.
