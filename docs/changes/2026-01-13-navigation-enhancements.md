# Navigation Enhancements - 2026-01-13

## Overview
Added keyboard navigation improvements for better usability with Bluetooth pedals and keyboard controls, specifically for reading tabs with the sticky chord header.

## Changes Made

### 1. Increased Page Up/Down Buffer
**File**: `freetar/static/custom.js:48-54`

**Previous**: 50px buffer
**New**: 120px buffer

```javascript
const scrollAmount = viewportHeight - headerHeight - 120; // 120px buffer for better overlap
```

**Purpose**: Provides more content overlap when using Page Up/Down keys, ensuring better reading continuity with Bluetooth pedal controls.

### 2. Arrow Key Navigation Between Headers
**File**: `freetar/static/custom.js:58-84`

Added new functionality for left/right arrow keys to jump between `chordlyrics-header` divs:

```javascript
} else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    
    const headers = Array.from(document.querySelectorAll('.chordlyrics-header'));
    // ... navigation logic
}
```

**Features**:
- **Left Arrow**: Jump to previous header
- **Right Arrow**: Jump to next header
- Smooth scrolling animation
- Proper offset calculation accounting for sticky header height
- 20px padding above target header for visual clarity

### 3. Reliable Header Detection Algorithm
**File**: `freetar/static/custom.js:66-76`

Implemented robust logic to determine current header position:

```javascript
// Find the first visible or just-passed header
let currentHeaderIndex = 0;
for (let i = 0; i < headers.length; i++) {
    const headerTop = headers[i].offsetTop;
    if (headerTop > currentScroll + 100) { // Header is significantly below current position
        currentHeaderIndex = Math.max(0, i - 1);
        break;
    }
    currentHeaderIndex = i; // This header is at or above current position
}
```

**Technical Details**:
- Uses `offsetTop` instead of `getBoundingClientRect()` for consistent behavior
- Works reliably in both full screen and with developer tools open
- Determines current position based on scroll offset rather than viewport calculations

## User Experience Improvements

### For Bluetooth Pedal Users
- **Page Up/Down**: Larger overlap (120px) prevents losing context when scrolling
- **Arrow Keys**: Quick section navigation without needing to manually scroll

### For Keyboard Users
- Intuitive arrow key navigation similar to other document viewers
- Smooth transitions between song sections
- Consistent behavior regardless of browser state

## Technical Details
- Uses [`offsetTop`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop) instead of [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) for consistent behavior
- Works reliably in both full screen and with developer tools open
- Determines current position based on scroll offset rather than viewport calculations

### Web APIs Used

#### DOM Properties
- **[`window.pageYOffset`](https://developer.mozilla.org/en-US/docs/Web/API/Window/pageYOffset)**: Gets the current vertical scroll position
- **[`window.innerHeight`](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight)**: Gets the viewport height
- **[`document.documentElement.scrollHeight`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight)**: Gets total document height
- **[`HTMLElement.offsetTop`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop)**: Gets element position relative to its offset parent

#### DOM Methods
- **[`document.querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)**: Selects single DOM elements
- **[`document.querySelectorAll()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll)**: Selects multiple DOM elements
- **[`window.scrollTo()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo)**: Scrolls the window to specified coordinates with smooth behavior option

#### Event APIs
- **[`keydown` Event](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event)**: Captures keyboard input
- **[`event.preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)**: Prevents default browser behavior for arrow keys
- **[`event.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)**: Identifies which key was pressed

## Browser Compatibility
- Works in all modern browsers
- Tested in Chrome, Firefox, Safari
- Consistent behavior in full screen and with developer tools

## Future Considerations
- Could add configuration options for buffer size
- Potential to add custom key bindings
- May consider adding visual indicators for current section