# Product Overview

Plane is an open-source project management tool for tracking issues, running cycles (sprints), and managing product roadmaps.

## Core Features

- **Issues**: Task management with rich text editor, file uploads, sub-properties, and issue references
- **Cycles**: Sprint-like iterations with burn-down charts and progress tracking
- **Modules**: Break down complex projects into manageable components
- **Views**: Custom filters for displaying relevant issues, shareable across teams
- **Pages**: Document creation with AI capabilities and rich text editing
- **Analytics**: Real-time insights and trend visualization across project data

## Architecture

- **Monorepo structure** with backend API and multiple frontend applications
- **Backend**: Django REST API (`apps/api`)
- **Frontend apps**:
  - `apps/web`: Main web application
  - `apps/admin`: Admin interface
  - `apps/space`: Public-facing space for project sharing
  - `apps/live`: Real-time collaboration service
- **Shared packages**: Reusable UI components, utilities, types, and services

## Deployment Options

- Plane Cloud (SaaS)
- Self-hosted via Docker, Kubernetes, or Docker Swarm

## License

AGPL-3.0
