# systemd Unit Builder

A visual tool for building systemd unit files — services, timers, sockets, mount points, and more.

Built for [ItsJust](https://itsjust.app), a collection of small, focused web utilities.

## Features

- **Visual form editor** — No manual syntax needed. Add sections and fields through an intuitive form.
- **Multiple unit types** — Service, Timer, Socket, Mount, Automount, Path, and Target units.
- **Smart field suggestions** — Context-aware field names and values (e.g., Type/Restart dropdowns for Service).
- **Live preview** — See the generated `.service` / `.timer` / `.socket` file in real-time.
- **Export & Share** — Export as JSON, PNG, JPEG, WebP, or PDF. Share via URL.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Vitest** with Testing Library
- **Playwright** for E2E tests

## License

[MIT](LICENSE)
