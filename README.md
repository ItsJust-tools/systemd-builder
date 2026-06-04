# systemd Unit Builder

[![CI](https://github.com/ItsJust-tools/systemd-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/ItsJust-tools/systemd-builder/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm](https://img.shields.io/badge/version-1.1.0-blue)](https://github.com/ItsJust-tools/systemd-builder)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A visual tool for building [systemd](https://systemd.io/) unit files — services, timers, sockets, mount points, and more. No manual syntax needed.

Built for [ItsJust](https://itsjust.app), a collection of small, focused web utilities.

## Features

- **Visual form editor** — No manual syntax needed. Add sections and fields through an intuitive form.
- **Multiple unit types** — Service, Timer, Socket, Mount, Automount, Path, and Target units with smart defaults.
- **Custom field names** — Autocomplete-suggested field names with the ability to type any systemd directive.
- **Smart field values** — Context-aware dropdowns for common fields like `Type` (simple/forking/oneshot/…) and `Restart` policies.
- **Section management** — Add, remove, and reorder sections to build complex unit files.
- **Keyboard-friendly** — Press Enter on the last value input to quickly add new fields.
- **Live preview** — See the generated `.service`/`.timer`/`.socket` file in real-time.
- **Validation warnings** — Sidebar highlights fields with missing keys or values.
- **Export & Share** — Export as JSON, PNG, JPEG, WebP, or PDF. Share via URL.
- **Dark mode / high contrast** — Fully theme-aware with `@itsjust/core`.

## Supported Unit Types

| Type       | Description                    | Default Sections              |
|------------|--------------------------------|-------------------------------|
| `service`  | Background service daemon      | Unit, Service, Install        |
| `timer`    | Timer-based activation         | Unit, Timer, Install          |
| `socket`   | Socket-based activation        | Unit, Socket, Install         |
| `mount`    | Filesystem mount point         | Unit, Mount, Install          |
| `automount`| Automated mount point          | Unit, Automount, Install      |
| `path`     | Path-based activation          | Unit, Path, Install           |
| `target`   | Grouping of units              | Unit, Target                  |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Choose a unit type** from the dropdown at the top.
2. **Name your unit** — this becomes the filename (e.g., `my-app.service`).
3. **Add fields** to each section using the form controls. Type any systemd directive or pick from autocomplete suggestions.
4. **Reorder sections** with the ▲/▼ buttons, add new sections, or remove unwanted ones.
5. **Preview** the generated unit file with the Show Preview button.
6. **Copy** the output or **export** as an image/PDF.

### Keyboard Shortcuts

| Shortcut           | Action                      |
|--------------------|-----------------------------|
| `Enter`            | Add a new field (on last value input) |
| `Escape`           | Blur current field input    |
| `Ctrl+Shift+E`     | Export all formats          |

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Vitest** with Testing Library
- **Playwright** for E2E tests

## Project Structure

```
src/
├── app/           # Next.js App Router pages
│   ├── globals.css  # Global styles + theme variables
│   ├── layout.tsx   # Root layout with ThemeProvider
│   ├── page.tsx     # Home page
│   └── …
├── lib/           # Shared utilities (seo, etc.)
├── tool/
│   ├── components/
│   │   ├── tool-canvas.tsx    # Main form editor
│   │   ├── tool-sidebar.tsx   # Info panel & validation
│   │   └── tool-toolbar.tsx   # Toolbar links
│   ├── types.ts               # Types, constants, unit file generator
│   ├── tool-definition.ts     # Tool lifecycle (init, serialize, deserialize)
│   ├── tool.config.ts         # Tool configuration
│   └── …
```

## Contributing

PRs are welcome! This tool follows the ItsJust-tools conventions:
- `@itsjust/core` provides the shared shell (toolbar, sidebar, status bar, theme)
- Each tool lives in `src/tool/` with a consistent structure
- Tests go in `__tests__/` (unit tests with Vitest, E2E with Playwright)

## License

[MIT](LICENSE)
