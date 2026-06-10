# Tech Stack

## Core

- **Runtime**: React 18 with TypeScript (strict mode)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3.4 with `darkMode: 'class'`
- **State Management**: Zustand (single-store pattern)
- **Routing**: React Router DOM v6

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

## Notes

- No test framework is configured
- No linter/formatter is configured (no ESLint, Prettier)
- No backend — AI calls go directly from the browser to AWS Bedrock
- AI credentials are stored in localStorage (base64-encoded)
