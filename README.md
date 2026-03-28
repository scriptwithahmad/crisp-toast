# Crisp Toast 🍞

A lightweight, beautiful, and highly customizable toast notification library specifically designed for React and Next.js applications, offering premium aesthetics.

![NPM Version](https://img.shields.io/npm/v/crisp-toast)
![License](https://img.shields.io/npm/l/crisp-toast)

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Next.js Usage](#nextjs-usage)
- [Usage](#usage)
  - [Toast Types](#toast-types)
  - [Variants](#variants)
  - [Colors](#colors)
  - [Placements](#placements)
  - [Promises](#promises)
- [API Reference](#api-reference)
- [License](#license)

## Features

- 🚀 **React & Next.js Ready**: Seamlessly integrates with modern React applications and the Next.js App Router.
- 🎨 **Beautiful Designs**: Support for Solid, Bordered, and Flat variants.
- 🌈 **Modern Colors**: Built-in palettes (Primary, Success, Danger, etc.).
- 🌗 **Theme Support**: Independent light/dark mode support for each toast.
- 🧭 **Precise Placement**: 6 different anchor positions.
- ⏳ **Progress Bar**: Visual countdown for auto-dismissal (optional).
- 📦 **Promise Support**: Easy handling of loading states.
- 📚 **Stacked Toasts**: Elegant stacking of multiple notifications. Hover to expand.
- 🛠️ **Fully Customizable**: Override styles, icons, and behavior.

## Installation

```bash
npm install crisp-toast
```

Or via yarn:

```bash
yarn add crisp-toast
```

## Quick Start

Import the library and its styles into your React component:

```tsx
import { toast } from 'crisp-toast';
import 'crisp-toast/style.css';

export default function App() {
  const showToast = () => {
    toast({ title: 'Settings saved!', color: 'success' });
  };

  return (
    <button onClick={showToast}>
      Show Toast
    </button>
  );
}
```

### Next.js Usage

Crisp Toast works perfectly in Next.js. Because it interacts with the browser's DOM, you **must** use the `'use client'` directive at the top of any file where you trigger toasts in the Next.js App Router.

```tsx
'use client';

import { toast } from 'crisp-toast';
// Ensure styles are imported either here or within your global layout
import 'crisp-toast/style.css';

export default function ClientComponent() {
  return (
    <button onClick={() => toast('Hello from Next.js!')}>
      Trigger Toast
    </button>
  );
}
```

## Live Demo

Check out the live playground for interactive testing and examples:  
[https://crisp-toast-playground.vercel.app/](https://crisp-toast-playground.vercel.app/)

## Usage

### Toast Colors

Crisp Toast uses the `color` prop to set the theme of the toast. The icon is automatically selected based on the color:

```javascript
toast({ title: 'Success!', color: 'success' });
toast({ title: 'Error occurred', color: 'danger' });
toast({ title: 'Warning', color: 'warning' });
toast({ title: 'Information', color: 'primary' });
toast({ title: 'Default toast', color: 'default' });
toast.loading('Processing...');
```

### Variants

Choose between three premium variants:

```javascript
toast({
  title: 'Success!',
  color: 'success',
  variant: 'bordered' // 'solid' | 'bordered' | 'flat' (default: 'bordered')
});
```

### Colors

Map toasts to your brand or state:

```javascript
toast({
  title: 'Custom Color',
  color: 'secondary' // 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
});
```

### Placements

Control exactly where the toast appears:

```javascript
toast({
  title: 'Top Center Toast',
  placement: 'top-center'
  // Options: 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'
});
```

### Promises

Handle asynchronous operations with ease:

```javascript
const savePromise = saveData();

toast.promise(savePromise, {
  loading: 'Saving your changes...',
  success: (data) => `Saved successfully: ${data.name}`,
  error: (err) => `Failed to save: ${err.message}`
});
```

### Theme Support

You can force a specific theme on a toast-by-toast basis, independent of the user's system preferences or application theme:

```javascript
// Force light theme
toast({
  title: 'Light Theme Toast',
  darkMode: false
});

// Force dark theme (default)
toast({
  title: 'Dark Theme Toast',
  darkMode: true
});
```

### Progress Bar

The progress bar is now disabled by default. To enable it, set `progressBar: true`:

```javascript
toast({
  title: 'With Progress Bar',
  progressBar: true
});
```

## API Reference

### `toast(options | string)`

The main function. You can pass a string for a simple message or an options object.

#### Options Object

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `undefined` | The main message of the toast. |
| `description`| `string` | `undefined` | Secondary text below the title. |
| `variant` | `'solid' \| 'bordered' \| 'flat'` | `'bordered'` | The visual style of the toast. |
| `color` | `ToastColor` | `'default'` | The color theme. |
| `placement` | `ToastPlacement` | `'bottom-right'` | Position on the screen. |
| `duration` | `number` | `3000` | Auto-dismissal time in ms. `0` or `Infinity` to keep forever. |
| `progressBar`| `boolean` | `false` | Whether to show the progress bar. |
| `darkMode` | `boolean` | `true` | Whether the toast should use dark theme. |
| `radius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Corner rounding. |
| `icon` | `React.ReactNode \| string \| HTMLElement \| boolean` | `true` | Pass React component (like Lucide), HTML string, element, or `false` to hide. |
| `maxVisibleToasts` | `number` | `5` | Maximum number of visible overlapping toasts on screen. |
| `endContent` | `React.ReactNode \| HTMLElement \| function` | `undefined` | Custom content at the end of the toast. |
| `action` | `{ label: React.ReactNode \| string, onClick: function }`| `undefined` | Add a call-to-action button. |
| `onClose` | `function` | `undefined` | Callback when toast is dismissed. |
| `customStyle`| `CSSStyleDeclaration` | `{}` | Custom CSS overrides. |
| `pauseOnHover`| `boolean` | `false` | Pause the timer when cursor enters toast. |

## License

MIT © [Ahmad](https://github.com/scriptwithahmad)
