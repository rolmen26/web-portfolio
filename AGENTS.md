# Agent Context and Rules

## Project Overview

Portafolio personal de Kevin Elihan Muñoz Calva. SPA construida con:

- **Vite 4** + **React 18** + **TypeScript** (strict)
- **Tailwind CSS** con tokens semánticos via CSS variables
- **React Router 6** — solo dos rutas reales: `/` y `/workspace`
- **Framer Motion**, **lucide-react**, **dnd-kit**, **recharts**
- Despliegue: Docker + Nginx en una instancia Oracle gestionada con **Dokploy**, DNS en Cloudflare. La imagen de producción se construye desde [Dockerfile.dokploy](Dockerfile.dokploy).

Estructura clave:

- [src/App.tsx](src/App.tsx) — router raíz (`/`, `/workspace`, `*` → `NotFound`)
- [src/components/Portfolio.tsx](src/components/Portfolio.tsx) — vista principal
- [src/components/ide/IdeWorkspace.tsx](src/components/ide/IdeWorkspace.tsx) — vista IDE
- [src/components/portfolio/](src/components/portfolio/) — secciones, hooks y data del portfolio
- [src/components/ui/](src/components/ui/) — primitivos (Button, Card, Input…)
- [src/index.css](src/index.css) — variables CSS de tema, fuentes globales, estilos base
- [ops/nginx/default.conf](ops/nginx/default.conf) — config Nginx con 404 HTTP real

## Environment

- Desarrollo local corre dentro de un contenedor Docker definido en [docker-compose.yml](docker-compose.yml) (servicio `portfolio`, Vite dev server en `5173`).
- Asegúrate de que comandos, puertos y rutas reflejen el entorno containerizado.
- Para producción se usa [Dockerfile.dokploy](Dockerfile.dokploy) (multi-stage: build con Node 20, sirve con `nginx:alpine` en puerto 80).

## Command Execution

Para cualquier comando dentro del entorno de desarrollo, ejecutarlo dentro del contenedor:

```bash
docker exec -it <container-name> <command>
```

Reemplaza `<container-name>` por el nombre real (por convención de Docker Compose suele ser `web-portfolio-portfolio-1`). Ejemplos:

```bash
docker exec -it web-portfolio-portfolio-1 npm run lint
docker exec -it web-portfolio-portfolio-1 npm run build
```

## Routing & 404

- Solo `/` y `/workspace` son rutas válidas.
- Cualquier otra ruta debe devolver **HTTP 404 real** desde Nginx, no 200 con fallback a `index.html`. La lógica vive en [ops/nginx/default.conf](ops/nginx/default.conf).
- La página estática [public/404.html](public/404.html) se sirve con status 404 en hard loads.
- El componente [src/components/NotFound.tsx](src/components/NotFound.tsx) cubre el caso de navegación cliente (ruta wildcard `*` en [src/App.tsx](src/App.tsx)).
- Si agregas rutas nuevas, **actualiza también** los `location =` explícitos en `ops/nginx/default.conf`.

## Design System

**Fuente de verdad:** [design-system/portfolio-design/MASTER.md](design-system/portfolio-design/MASTER.md) y las variables CSS reales en [src/index.css](src/index.css:7-92).
Para la vista IDE existe un override propio: [design-system/ide-workspace/MASTER.md](design-system/ide-workspace/MASTER.md).
Si llega a existir un override por página en `design-system/pages/[page-name].md`, ese archivo **gana** sobre el MASTER.

### Regla #1: usar tokens semánticos, no hex

Prefiere siempre las utilidades de Tailwind que apuntan a las variables CSS:

| Token | Tailwind | Dark (Catppuccin Mocha) | Light (Catppuccin Latte) |
| --- | --- | --- | --- |
| Fondo página | `bg-background` / `text-foreground` | `#181825` / `#cdd6f4` | `#eff1f5` / `#4c4f69` |
| Superficie / cards | `bg-card` / `text-card-foreground` | `#1e1e2e` / `#cdd6f4` | `#ffffff` / `#4c4f69` |
| Primario (Mauve) | `bg-primary` / `text-primary` | `#cba6f7` | `#8839ef` |
| Acento (Sky) | `bg-accent` / `text-accent` | `#89dceb` | `#04a5e5` |
| Secundario | `bg-secondary` | `#585b70` | `#ccd0da` |
| Destructive | `bg-destructive` / `text-destructive` | `#f38ba8` | `#d20f39` |
| Muted | `bg-muted` / `text-muted-foreground` | `#292c3c` / `#a6adc8` | `#dce0e8` / `#6c6f85` |
| Border | `border-border` | `#45475a` | `#bcc0cc` |
| Sidebar / IDE rail | `bg-sidebar` | `#11111b` | `#e6e9ef` |

Solo recurre a hex literales para gradientes muy específicos o cuando estés escribiendo HTML estático (como [public/404.html](public/404.html)), y en esos casos espeja los mismos valores Catppuccin.

### Tipografía

Cargadas en [src/index.css:1](src/index.css#L1) desde Google Fonts:

- **`Montserrat`** → sans default (`body`, `var(--font-sans)`)
- **`Space Grotesk`** → títulos y display. Aplica automáticamente a `h1`–`h6` o usa la clase `font-display`
- **`Fira Code`** → mono (`var(--font-mono)`). Para forzarlo en un bloque, usa `style={{ fontFamily: 'var(--font-mono)' }}` (Tailwind no tiene `font-mono` mapeado a esta variable)
- `Archivo` queda como fallback histórico, no es la fuente principal

### Modo oscuro

- Se controla con la clase `dark` en `<html>` (Tailwind `darkMode: ["class"]`)
- El hook [usePortfolioPreferences](src/components/portfolio/hooks/usePortfolioPreferences.ts) persiste la preferencia en `localStorage` con la key `portfolio:dark-mode`
- Para HTML estático servido fuera de React (ej. `public/404.html`), aplica `.dark` al `<html>` leyendo la misma key antes del primer paint

### Estilo visual

- IDE-inspired, vibrante, alto contraste de color, geometría limpia
- Evitar diseño plano sin profundidad: usar shadows suaves, `backdrop-filter: blur(...)` en superficies translúcidas, gradientes radiales sutiles
- Hover states siempre presentes; transiciones 150–300 ms
- `cursor-pointer` en cualquier elemento interactivo (link, botón, card clickable)
- **Iconos: Lucide (`lucide-react`)**, nunca emojis
- Evitar emojis en código y commits salvo que el usuario los pida explícitamente

### Componentes

- Reutilizar primitivos de [src/components/ui/](src/components/ui/) (`Button`, `Card`, `Input`, `Textarea`, `Badge`, `Tabs`)
- `Button` acepta `variant` (`default`, `outline`, `ghost`, `secondary`, `destructive`, `link`) y `size` (`default`, `sm`, `lg`, `icon`)
- Si necesitas un `<Link>` de React Router con apariencia de botón, usa `cn(buttonVariants({ ... }), "extra-classes")` directamente sobre `<Link>` en lugar de `<Button asChild>` (el `asChild` actual envuelve en `<span>`)

## Build & Lint

```bash
npm run dev       # Vite dev server (5173)
npm run build     # tsc + vite build → dist/
npm run lint      # eslint con --max-warnings 0
npm run preview   # servir dist/ localmente
```

`tsconfig.json` tiene `strict`, `noUnusedLocals` y `noUnusedParameters` activos. Cualquier import o variable sin uso rompe el build.
