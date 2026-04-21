# Web Portfolio – React + Vite + Tailwind

Personal portfolio built with React 18, Vite, TypeScript, Tailwind CSS, and a small local set of shadcn/ui-style components. It includes animations (Framer Motion), charts (Recharts), and a themed UI with light/dark mode.

This README covers local development, Docker usage, scripts, customization points (photo/CV), and deployment tips.

## Tech stack

- React 18 + TypeScript 5
- Vite 4 (dev server and build)
- Tailwind CSS 3 (+ tailwindcss-animate)
- Local UI components inspired by shadcn/ui (in `src/components/ui`)
- Framer Motion (animations)
- Recharts (radar chart in Skills section)
- lucide-react (icons)

## Prerequisites

- Node.js 18+ (Dockerfile uses `node:18-alpine`)
- npm 9+ (comes with Node 18)

Optional:

- Docker and Docker Compose (for containerized dev)

## Getting started (local)

1) Install dependencies

```bash
npm install
```

2) Start the dev server (Vite on port 5173)

```bash
npm run dev
```

3) Open the app

- http://localhost:5173

Build for production and locally preview the build:

```bash
npm run build
npm run preview
```

## Getting started (Docker)

### Development (Vite dev server)

This repository includes a dev-focused Dockerfile and a `docker-compose.yml` that mounts the source for instant reload in the container.

Run with Docker Compose:

```bash
docker compose up --build
```

Then open http://localhost:5173

Notes:

- Live reload works thanks to the project folder bind mount (`.:/app`).
- The container runs `npm run dev -- --host 0.0.0.0` to be reachable from your host.

### Production (Caddy with automatic HTTPS)

For production deployment, use the multi-stage `Dockerfile.prod.caddy` that builds the app and serves it with Caddy:

```bash
# Build the production image
docker compose -f docker-compose.prod.yml build

# Start the production container
docker compose -f docker-compose.prod.yml up -d

# Verify it's running
docker compose -f docker-compose.prod.yml ps
curl -I http://localhost
```

The production setup:

- Uses Node 20 Alpine to build the app (`npm run build` → `dist/`)
- Copies the build output to a Caddy Alpine image
- Caddy config at `Caddyfile` handles SPA routing (all routes → `index.html`)
- **Automatic HTTPS**: Caddy obtains and renews Let's Encrypt certificates automatically when you configure your domain
- Serves on ports 80 (HTTP) and 443 (HTTPS)
- Persistent volumes (`caddy_data`, `caddy_config`) store certificates between restarts

**To enable HTTPS with your domain:**

1. Edit `Caddyfile` and replace `:80` with your actual domain:
   ```
   your-domain.com, www.your-domain.com {
       root * /usr/share/caddy
       try_files {path} /index.html
       file_server
   }
   ```

2. Ensure DNS A/AAAA records point to your server's IP

3. Rebuild and restart:
   ```bash
   docker compose -f docker-compose.prod.yml down
   docker compose -f docker-compose.prod.yml build
   docker compose -f docker-compose.prod.yml up -d
   ```

4. Caddy will automatically obtain a valid SSL certificate from Let's Encrypt

**Alternative: Nginx setup (legacy)**

If you prefer Nginx instead of Caddy, use `Dockerfile.prod` (without auto-HTTPS):
- Config at `ops/nginx/default.conf`
- Only port 80; for HTTPS you'll need a reverse proxy or manual cert setup

## Available scripts

Defined in `package.json`:

- `npm run dev` – Start Vite dev server.
- `npm run build` – Type-check and build to `dist/`.
- `npm run preview` – Preview the production build locally.
- `npm run lint` – Lint with ESLint (requires your ESLint config if you plan to customize rules).

## Project structure

Key files and folders:

- `src/` – Application source
	- `App.tsx` and `main.tsx` – App entry
	- `components/` – UI and feature components
		- `ui/` – Local shadcn/ui-style primitives (Button, Card, Tabs, etc.)
		- `InteractiveTerminal.tsx` – Animated “terminal” used in the hero
		- `Portfolio.tsx` – Main page sections (hero, projects, skills, contact, etc.)
- `index.html` – Vite HTML entry
- `src/index.css` – Tailwind tokens, light/dark theme variables, and small animations
- `public/` – Static assets served at site root
- `vite.config.ts` – Vite config, including `@` alias to `src`
- `tailwind.config.js` – Tailwind setup + animate plugin
- `Dockerfile`, `docker-compose.yml` – Dev container config
- `Dockerfile.prod.caddy`, `docker-compose.prod.yml` – Production container with Caddy (auto-HTTPS)
- `Dockerfile.prod` – Alternative production setup with Nginx (manual HTTPS)
- `Caddyfile` – Caddy config for SPA routing and HTTPS
- `ops/nginx/default.conf` – Nginx config (if using Dockerfile.prod)

Path alias:

- `@` → `./src` (e.g., `import { Button } from "@/components/ui/button"`)

## Customization

Update the following assets and content to personalize:

- Profile photo: `public/images/Me.PNG` (used in `Portfolio.tsx`). Replace with your image or adjust the path in code.
- CV download: place your file at `public/cv-rommel-soriano.pdf`, or update the link in `Portfolio.tsx` (section “CV”).
- Social links, contact info, projects, and experience: edit values in `src/components/Portfolio.tsx`.
- Colors and theme: tweak CSS variables in `src/index.css` and Tailwind theme tokens in `tailwind.config.js`.

### Theme Tokens (Light + Dark)

The project uses semantic CSS variables in `src/index.css`:

- `:root` → light mode defaults
- `.dark` → dark mode overrides

Core tokens:

- `--background`, `--foreground`, `--card`, `--border`, `--muted`
- `--primary`, `--secondary`, `--accent`, `--ring`, `--destructive`

When styling components, prefer semantic classes (`bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted-foreground`, `bg-primary`) instead of fixed hex values so both themes stay consistent.

## Environment variables

No environment variables are required for local development by default. If you introduce API keys or endpoints later, create a `.env` file (git-ignored) and reference variables using `import.meta.env` (Vite convention). Example:

```bash
VITE_API_BASE_URL=https://api.example.com
```

Use in code: `import.meta.env.VITE_API_BASE_URL`.

## Deployment

### Static hosting

This is a static site once built (`dist/`). You can deploy to any static host:

- **Vercel / Netlify**: point to `npm run build` and serve `dist/`.
- **GitHub Pages**: build locally or in CI and publish `dist/`.
- **Any static server**: copy `dist/` to your server.

### Docker (production with Caddy)

The default production setup uses Caddy with automatic HTTPS. For containerized deployment:

1. **Configure your domain** in `Caddyfile` (replace `:80` with your domain)

2. **Build and start:**

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

3. **Verify:**

```bash
docker compose -f docker-compose.prod.yml ps
curl -I https://your-domain.com  # Should show valid HTTPS
```

**Key benefits:**
- Automatic Let's Encrypt certificates (no manual setup)
- Auto-renewal (Caddy handles it)
- HTTP → HTTPS redirect built-in
- Certificates persist in Docker volumes (`caddy_data`, `caddy_config`)

**For deployment to a remote server:**

```bash
# On your server (after git pull)
docker compose -f docker-compose.prod.yml up -d
```

**To push to a registry:**

```bash
docker tag web-portfolio-web:latest your-registry/web-portfolio:latest
docker push your-registry/web-portfolio:latest
```

## Troubleshooting

- Port already in use (5173): stop other dev servers or set a different port `npm run dev -- --port 5174`.
- Node version: use Node 18+ for compatibility with the provided Dockerfile and tooling.
- Styles not applied: ensure Tailwind content globs include your file paths (already configured for `src/**`).
- Images or CV not found: verify files under `public/` and referenced paths in components.

## License

MIT. See the `LICENSE` file for details.
