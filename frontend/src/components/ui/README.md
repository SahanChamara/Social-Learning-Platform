# UI Components

This directory contains all reusable UI components for the Social Learning Platform frontend.

## Components

### Button
A versatile button component built with Radix UI Slot and styled with Tailwind CSS.

**Variants:**
- `default` - Primary blue button
- `destructive` - Red button for dangerous actions
- `outline` - Outlined button with border
- `secondary` - Gray secondary button
- `ghost` - Transparent button with hover effect
- `link` - Text button styled as a link

**Sizes:**
- `default` - Standard height (40px)
- `sm` - Small (36px)
- `lg` - Large (44px)
- `icon` - Square button for icons (40x40px)

**Usage:**
```tsx
import { Button } from '@/components/ui';

<Button variant="default" size="lg">
  Click Me
</Button>

<Button variant="outline" size="icon">
  <Heart className="h-4 w-4" />
</Button>
```

### Input
A styled input component with built-in error state support.

**Features:**
- Label integration with Radix UI Label
- Error message display
- Focus ring with blue accent
- Fully accessible

**Usage:**
```tsx
import { Input, Label } from '@/components/ui';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    error="This field is required"
  />
</div>
```

### Card
A flexible card component with multiple sub-components for structured content.

**Sub-components:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title heading
- `CardDescription` - Subtitle/description
- `CardContent` - Main content area
- `CardFooter` - Footer section (often for actions)

**Usage:**
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
} from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your content here...</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Toast
A notification toast system built with Radix UI Toast primitives.

**Variants:**
- `default` - White background with gray text
- `success` - Green background for success messages
- `destructive` - Red background for errors
- `warning` - Yellow background for warnings

**Features:**
- Auto-dismiss after 5 seconds
- Manual dismiss with X button
- Swipe to dismiss
- Animation on enter/exit
- Maximum 5 toasts displayed at once
- Position: Top on mobile, Bottom-right on desktop

**Usage:**
```tsx
import { toast } from '@/hooks/useToast';
import { Button } from '@/components/ui';

<Button
  onClick={() => {
    toast({
      variant: "success",
      title: "Success!",
      description: "Your changes have been saved.",
    });
  }}
>
  Show Toast
</Button>
```

## Utilities

### cn (ClassName Utility)
Located in `@/lib/utils.ts`, this utility function merges class names using `clsx`.

**Usage:**
```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  condition && "conditional-class",
  "another-class"
)} />
```

## Testing

Visit `/components-demo` route to see all components in action with interactive examples.

## Tech Stack

- **Radix UI** - Unstyled, accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **class-variance-authority** - For managing component variants
- **clsx** - For conditional className merging
- **lucide-react** - Icon library

## Design System

All components follow a consistent design system:
- **Primary Color**: Blue (#2563eb)
- **Error Color**: Red (#dc2626)
- **Success Color**: Green (#16a34a)
- **Warning Color**: Yellow (#eab308)
- **Focus Ring**: 2px ring with 2px offset
- **Border Radius**: 6px (rounded-md)
- **Transitions**: 150ms ease for color changes
