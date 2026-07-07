# Tech Stack

## Core

- **Runtime**: React 18 with TypeScript (strict mode)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3.4 with `darkMode: 'class'`
- **State Management**: Zustand (single-store pattern)
- **Routing**: React Router DOM v6
- **Backend**: Express.js API server with PostgreSQL (via `pg`)

## Key Libraries

| Purpose | Library |
|---------|---------|
| Rich text editing | TipTap (with extensions: bold, italic, lists, headings) |
| AI integration | AWS SDK - Bedrock Runtime (`@aws-sdk/client-bedrock-runtime`) |
| PDF export | jsPDF |
| DOCX export | docx + file-saver |
| Screenshot | html2canvas |
| Date formatting | date-fns (pt-BR locale) |
| Icons | lucide-react |
| Database | pg (PostgreSQL client) |
| Server | express + cors |

## TypeScript Configuration

- Target: ES2020
- Module: ESNext with bundler resolution
- Path alias: `@/*` → `./src/*`
- Strict mode enabled
- JSX: react-jsx

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Build (type-check + bundle) | `npm run build` |
| Preview production build | `npm run preview` |

## Deployment

- **Platform**: Dokploy (Docker-based)
- **Auto-deploy**: Enabled via manual trigger (webhook not configured)
- **Application ID**: `0rqsi-JfF5NiOUXt2PzYd`
- **Dockerfile**: Multi-stage build (frontend + server in single container)
- **Database**: PostgreSQL managed by Dokploy in same project

## Notes

- No test framework is configured
- No linter/formatter is configured (no ESLint, Prettier)
- AI calls go directly from the browser to AWS Bedrock (no backend proxy)
- AI credentials are stored in localStorage (base64-encoded)
- RCA data persisted in PostgreSQL via Express API (`server/index.js`)
- Downtime is calculated automatically from timeline events (first/last entry)
- Export supports per-client filtering (document shows only selected client)
