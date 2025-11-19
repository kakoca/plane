# Project Structure

## Root Layout

```
plane/
├── apps/              # Application services
├── packages/          # Shared libraries
├── deployments/       # Deployment configurations
├── doc/              # Documentation and references
└── logs/             # Development logs
```

## Apps Directory

Each app is independently deployable with its own Dockerfile:

- **`apps/api`**: Django REST API backend (Python)
  - `plane/`: Django project modules
  - `requirements/`: Python dependencies
  - `manage.py`: Django management script

- **`apps/web`**: Main web application (React Router + Vite)
  - `app/`: React Router application code
  - `core/`: Core business logic
  - `helpers/`: Utility functions
  - `pages/`: Legacy page components
  - `ce/`: Community Edition features
  - `ee/`: Enterprise Edition features

- **`apps/admin`**: Admin dashboard (React Router + Vite)
  - Similar structure to web app

- **`apps/space`**: Public project space (React Router + Vite)
  - Similar structure to web app

- **`apps/live`**: Real-time collaboration service (Node.js)
  - `src/`: TypeScript source

- **`apps/proxy`**: Caddy reverse proxy (Community Edition)

## Packages Directory

Shared libraries used across apps:

- **`packages/propel`**: UI component library (Storybook-documented)
- **`packages/editor`**: Rich text editor (TipTap-based)
- **`packages/graph-engine`**: Graph visualization engine
- **`packages/types`**: Shared TypeScript types
- **`packages/constants`**: Shared constants
- **`packages/hooks`**: React hooks
- **`packages/services`**: API service layer
- **`packages/shared-state`**: MobX state management
- **`packages/utils`**: Utility functions
- **`packages/i18n`**: Internationalization
- **`packages/logger`**: Logging utilities
- **`packages/decorators`**: TypeScript decorators
- **`packages/ui`**: Legacy UI components
- **`packages/tailwind-config`**: Shared Tailwind configuration
- **`packages/typescript-config`**: Shared TypeScript configuration
- **`packages/eslint-config`**: Shared ESLint configuration

## Workspace Configuration

- **`pnpm-workspace.yaml`**: Defines workspace packages
- **`turbo.json`**: Turborepo pipeline configuration
- **`package.json`**: Root package with workspace scripts

## Build Artifacts

- **`.turbo/`**: Turborepo cache
- **`dist/`**: Built package output (packages)
- **`build/`**: Built app output (apps)
- **`.react-router/`**: React Router build cache
- **`node_modules/`**: Dependencies

## Configuration Files

- **`.env`**: Environment variables (gitignored)
- **`.env.example`**: Environment variable templates
- **`tsconfig.json`**: TypeScript configuration per package/app
- **`vite.config.ts`**: Vite configuration (frontend apps)
- **`tsdown.config.ts`**: tsdown configuration (packages)
- **`tailwind.config.cjs`**: Tailwind configuration per app
- **`.eslintrc.cjs`**: ESLint configuration per package/app
- **`.prettierrc`**: Prettier configuration

## Naming Conventions

- **Packages**: Scoped with `@plane/` prefix (e.g., `@plane/propel`)
- **Apps**: Simple names (e.g., `web`, `api`, `admin`)
- **Workspace references**: Use `workspace:*` or `workspace:^version` in package.json
- **Environment variables**: Prefix with `VITE_` for client-side access

## Edition-Specific Code

- **`ce/`**: Community Edition features
- **`ee/`**: Enterprise Edition features (may not be present in all forks)

## Docker Structure

- **`Dockerfile.{app}`**: Production Dockerfile per app
- **`Dockerfile.dev`**: Development Dockerfile per app
- **`nginx/`**: Nginx configuration for serving built apps
- **`.dockerignore`**: Files to exclude from Docker context
