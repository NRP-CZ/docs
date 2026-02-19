# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Nextra-based documentation site for NRP-CZ (National Repository Platform - Czech Republic), built with Next.js. It documents the InvenioRDM-based repository platform.

## Build & Development Commands

```bash
# Install dependencies (use pnpm)
pnpm install

# Development server (uses Turbopack)
pnpm dev

# Production build
pnpm build

# Serve static export locally
pnpm serve

# Build with search index (runs pagefind automatically via postbuild)
pnpm build && pnpm serve
```

## Architecture

### Framework
- **Nextra 4.6+** - Documentation framework on top of Next.js 16
- **Nextra Theme Docs** - Documentation theme with sidebar navigation
- **MDX** - All content is written in MDX files

### Content Structure
```
content/
├── _meta.js              # Root navigation config
├── index.mdx             # Homepage
├── installation/         # Getting started guides
├── userguide/           # User guides
├── administration/      # Admin guides
├── customize/           # Customization docs
│   ├── model_ui/       # Model UI customization
│   ├── model_backend/  # Model backend
│   ├── repository_ui/  # Repository UI
│   └── workflows/      # Workflow customization
└── deploy/             # Deployment guides
```

### Navigation Configuration
Each directory has a `_meta.js` file defining the navigation structure:

```javascript
export default {
  "index": { "title": "Overview" },
  "installation": { "title": "» Get Started", "type": "page" },
  // ...
}
```

### Custom Components

Located in `components/`:

| Component | Purpose |
|-----------|---------|
| `Card.tsx` | Custom card component for related links |
| `Badge.tsx` | Badge component with variants (yellow, green, red) |
| `GitHubCode.tsx` | Fetches and displays code from GitHub repos |
| `counters.tsx` | Example interactive React component |

Usage in MDX:
```mdx
import { Card } from "@/components/card";
import { Badge } from "@/components/badge";

<Badge variant="green">New in v14</Badge>
```

### Nextra Components

Available without import (provided by theme):
- `<Steps>` - Numbered step lists
- `<Callout type="info|warning|error">` - Callout boxes
- `<Cards>` / `<Card>` - Card grids
- `<FileTree>` - Directory tree visualization
- `<Tabs>` / `<Tab>` - Tabbed content

### MDX Component Registration

Custom components are registered in `mdx-components.jsx`:

```javascript
export function useMDXComponents(components) {
  return {
    ...getDocsMDXComponents(),
    ...components,
    GitHubCode  // Custom component available in all MDX
  }
}
```

## Content Patterns

### Frontmatter (not used)
Nextra 4 doesn't use YAML frontmatter. Page metadata is configured in `_meta.js` files.

### Code Blocks with Filenames
```mdx
```python filename="ui/mymodel/__init__.py"
# Code here
```
```

### Links to Other Pages
Use root-relative paths:
```mdx
See [Record landing page](/customize/model_ui/detail)
```

### External Links in New Tab
```mdx
<a href="https://github.com/..." target="_blank" rel="noopener noreferrer">Link</a>
```

## Search

Pagefind is used for search. It indexes content during build (`postbuild` script). Search UI is automatic from Nextra theme.

## Common Tasks

### Adding New Documentation Section
1. Create folder in `content/`
2. Add `_meta.js` for navigation
3. Add `.mdx` files
4. Update parent's `_meta.js` to include new section

### Adding Custom Component
1. Create component in `components/`
2. Export it in `mdx-components.jsx`
3. Use in MDX files with import or directly (if registered)

### Linking to GitHub Code
Use the `GitHubCode` component:
```mdx
<GitHubCode repo="oarepo/oarepo-ui" path="oarepo_ui/templates/oarepo_ui/record_detail.html" />
```

## Deployment

Static export configured in `next.config.mjs`:
- `output: 'export'`
- `basePath: "/docs"` - Deployed under /docs path
- Images are unoptimized for static export

## Repository Links

- **Docs repo**: https://github.com/NRP-CZ/docs
- **Edit link base**: https://github.com/NRP-CZ/docs/blob/main/
