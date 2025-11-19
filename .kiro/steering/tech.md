# Tech Stack

## Build System

- **Package manager**: pnpm (v10.21.0+)
- **Monorepo tool**: Turborepo (v2.6.1)
- **Node version**: 22.18.0+
- **Python version**: 3.8+

## Frontend Stack

- **Framework**: React 18.3.1 with React Router v7
- **Build tool**: Vite 7.1.11
- **Bundler**: tsdown (for packages)
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS with shared config
- **State management**: MobX 6.12.0
- **Data fetching**: SWR 2.2.4, Axios 1.12.0
- **UI libraries**:
  - Custom component library (`@plane/propel`)
  - Headless UI, Radix UI primitives
  - TipTap editor for rich text
  - React Flow for graph visualizations
  - Recharts for analytics

## Backend Stack

- **Framework**: Django (Python)
- **API**: Django REST Framework
- **Database**: PostgreSQL v14+
- **Cache**: Redis v6.2.7+
- **Linting**: Ruff (Python)

## Common Commands

### Development

```bash
# Install dependencies
pnpm install

# Start all services (requires Docker)
docker compose -f docker-compose-local.yml up

# Start frontend dev servers
pnpm dev

# Start specific app
pnpm --filter web dev
pnpm --filter @plane/propel dev
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @plane/propel build
```

### Code Quality

```bash
# Run all checks (format, lint, types)
pnpm check

# Fix formatting and linting
pnpm fix

# Lint only
pnpm check:lint

# Type check only
pnpm check:types
```

### Python (API)

```bash
cd apps/api

# Run tests
python run_tests.py
# or
./run_tests.sh

# Create superuser
python create_superuser.py
```

## Environment Variables

All frontend environment variables must be prefixed with `VITE_` to be exposed to the client.

Common variables:
- `VITE_API_BASE_URL`: Backend API endpoint
- `VITE_WEB_BASE_URL`: Web app URL
- `VITE_ADMIN_BASE_URL`: Admin app URL
- `VITE_SPACE_BASE_URL`: Space app URL

See `.env.example` files in each app directory for complete lists.

## Docker

- Development: `docker-compose-local.yml`
- Production: `docker-compose.yml`
- Individual Dockerfiles per app (e.g., `Dockerfile.web`, `Dockerfile.api`)

## Key Dependencies

- **Drag & drop**: @atlaskit/pragmatic-drag-and-drop
- **Forms**: react-hook-form
- **Date handling**: date-fns
- **Markdown**: react-markdown
- **PDF**: @react-pdf/renderer
- **Analytics**: PostHog, Sentry
