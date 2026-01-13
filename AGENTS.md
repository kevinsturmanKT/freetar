# Freetar Development Guide

This guide is for agentic coding agents working on the Freetar codebase - an open-source alternative frontend to Ultimate Guitar.

## Build, Test, and Development Commands

### Development
```bash
# Install dependencies (Poetry-based project)
poetry install

# Run development server with Flask debug mode
poetry run python freetar/backend.py
# or use just
just dev

# Start main application entry point
poetry run freetar
```

### Docker/Production
```bash
# Build Docker image (multi-stage Alpine build)
docker build -t freetar .
just build

# Run production container
docker run -p 22000:22000 freetar

# Or use compose (uses podman)
just redploy    # Build and restart containers
just restart    # Restart containers
podman compose up -d
```

### Testing
```bash
# Currently no test framework configured
# tests/ directory exists but is empty
# Add pytest setup for future test implementation
```

## Code Style Guidelines

### Python (Flask Backend)

#### Naming Conventions
- **Functions/Variables**: `snake_case`
- **Classes**: `PascalCase` (mainly dataclasses)
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `snake_case.py`

#### Imports Organization
```python
# Standard library imports first
import re
import json
from typing import Optional

# Third-party imports next
from flask import Flask, request, render_template
from bs4 import BeautifulSoup
import requests

# Local imports last
from freetar.ug import scrape_ultimate_guitar
from freetar.utils import helper_function
```

#### Type Hints
```python
def search_songs(query: str, page: int = 1) -> list[SearchResult]:
    """Search for songs on Ultimate Guitar."""
    pass

@app.route("/tab/<path:tab_url>")
def view_tab(tab_url: str) -> str:
    """Render individual tab page."""
    pass
```

#### Error Handling
```python
# Use custom FreetarError for application-specific errors
class FreetarError(Exception):
    """Custom exception for Freetar application errors."""
    pass

# Flask error handlers
@app.errorhandler(FreetarError)
def handle_freetar_error(e):
    return render_template('error.html', error=str(e)), 400

# Always handle network requests gracefully
try:
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
except requests.RequestException as e:
    raise FreetarError(f"Failed to fetch data: {e}")
```

#### Caching Strategy
```python
# Use Flask-Caching for expensive operations
@app.route("/search")
@cache.cached(timeout=3600, query_string=True)  # 1 hour cache
def search():
    pass

# Cache is configured with SimpleCache, 10,000 threshold
```

### JavaScript/jQuery (Frontend)

#### Naming Conventions
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Event Handlers**: Descriptive names with `_click`, `_change` suffixes
- **jQuery Selectors**: Cache frequently used selectors

```javascript
// Constants
const SCROLL_STEP_SIZE = 3;
const SCROLL_TIMEOUT_MINIMUM = 50;

// Function naming
function initializeTranspose() {
    // Initialize transposition functionality
}

function handlePageScroll() {
    // Handle page scrolling logic
}

// Event handlers
$('#transpose_up').click(function() {
    // Handle transpose up button click
});

// Cache jQuery selectors
const $checkboxAutoscroll = $('#checkbox_autoscroll');
const $tabElement = $('.tab');
```

#### Client-Side Storage
```javascript
// Use localStorage for persistence
favorites = JSON.parse(localStorage.getItem("favorites")) || {};

// Always validate data before storing
localStorage.setItem("favorites", JSON.stringify(favorites));
localStorage.setItem("fontSize", parseFloat(fontSize));
```

### HTML/Jinja2 Templates

#### Template Structure
```html
{% extends "base.html" %}

{% block content %}
<!-- Content here -->
{% endblock %}
```

#### Naming
- **Templates**: `snake_case.html`
- **Blocks**: `snake_case`
- **Variables**: `snake_case` (Python convention carries through)

#### CSS Classes
- **Bootstrap**: Use Bootstrap utility classes primarily
- **Custom**: `PascalCase` for components (`.StickyChords`, `.ChordDiagram`)
- **States**: Use descriptive classes like `.d-print-none`, `.favorite`

## Project Architecture

### Key Components

#### Backend (`freetar/backend.py`)
- Flask application with caching
- Route handlers for search, tab view, favorites
- Error handling with custom exceptions
- Template context processors

#### Web Scraping (`freetar/ug.py`)
- Ultimate Guitar scraping with BeautifulSoup
- Request handling with custom User-Agent
- Chord extraction and parsing with regex
- Pagination support

#### Frontend (`freetar/static/custom.js`)
- jQuery-based interactions
- Auto-scroll functionality with pause on interaction
- Chord transposition (±11 semitones)
- LocalStorage for favorites persistence
- Page Up/Down keyboard handling for pedal support

#### Templates (`freetar/templates/`)
- Bootstrap 5 responsive design
- Dark mode support via CSS variables
- Mobile-first approach
- Custom chord rendering with chordLyrics.js

## Development Workflow

1. **Setup**: Use `poetry install` for dependencies
2. **Development**: `just dev` or `poetry run python freetar/backend.py`
3. **Testing**: No framework currently - add pytest for future tests
4. **Build**: `just build` for Docker image
5. **Deploy**: `just redploy` for production deployment

## Important Conventions

### Web Scraping
- Always use proper User-Agent headers
- Implement request timeouts
- Handle network errors gracefully
- Respect rate limiting with caching

### Client-Side Features
- All user preferences stored in localStorage
- Responsive design required for mobile musicians
- Auto-scroll should pause on user interaction
- Page Up/Down keys must account for sticky headers

### Security
- No server-side storage of user data
- All user data client-side only (favorites, preferences)
- Input validation for search queries
- Proper error handling without exposing internals

### Performance
- Aggressive caching for scraped content
- Minify HTML/JS/CSS in production
- Lazy loading of chord diagrams
- Efficient DOM manipulation with jQuery

## Testing Strategy (Future)

When implementing tests:
- Use pytest for Python backend testing
- Test web scraping with mock responses
- Test JavaScript functionality with browser automation
- Test responsive design on multiple viewports
- Test keyboard/pedal functionality

## Configuration

- **Port**: 22000 (both development and production)
- **Cache**: SimpleCache with 10,000 item threshold
- **Docker**: Multi-stage Alpine Linux build
- **User**: Non-root `freetar` user in containers
- **Dependencies**: Managed via Poetry in pyproject.toml