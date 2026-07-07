# Project Structure

```
src/
├── App.tsx              # Root component, route definitions
├── main.tsx             # Entry point, BrowserRouter setup
├── index.css            # Tailwind directives + custom component classes
├── components/          # React UI components
│   ├── Layout.tsx       # Main page layout (header + form/preview + footer)
│   ├── Header.tsx       # Top bar with nav, export, theme toggle, publish/save
│   ├── RCAForm.tsx      # Section-based form with sidebar navigation
│   ├── RCAPreview.tsx   # Read-only document preview
│   ├── AIAssistant.tsx  # Floating AI suggestion panel
│   ├── RichTextEditor.tsx  # TipTap-based rich text input
│   ├── TimelineEditor.tsx  # Timeline entries CRUD + downtime calculation
│   ├── ActionsTable.tsx    # Corrective/Preventive actions table
│   ├── ExportButtons.tsx   # PDF/DOCX export triggers (from form header)
│   ├── RCAList.tsx         # Saved RCAs list with per-client export
│   ├── Reports.tsx         # Downtime & SLA tables with pagination
│   ├── ClientSelector.tsx  # Multi-select for affected clients
│   ├── AdminPanel.tsx      # AI config page (/admin)
│   ├── UserGuide.tsx       # User guide page
│   └── ThemeToggle.tsx     # Dark/light switch
├── context/             # State stores
│   ├── RCAContext.tsx   # Zustand store: RCA document + AI config
│   └── ThemeContext.tsx # React Context for theme (light/dark)
├── hooks/               # Custom hooks
│   ├── useAI.ts         # AI suggestion logic
│   ├── useRCA.ts        # Thin wrapper over RCAStore
│   └── useTheme.ts      # Theme hook
├── services/            # Business logic / external integrations
│   ├── aiService.ts     # AWS Bedrock client + prompt builder
│   ├── apiService.ts    # REST API client (CRUD for RCAs, clients, auth)
│   ├── exportDocx.ts    # DOCX generation with docx library
│   └── exportPdf.ts     # PDF generation with jsPDF
├── types/
│   └── rca.ts           # TypeScript interfaces (RCADocument, AIConfig, etc.)
└── utils/
    └── formatters.ts    # Date formatting, downtime calc, HTML stripping
```

```
server/
├── index.js             # Express API server (PostgreSQL, auth, reports)
└── package.json         # Server dependencies
```

## Conventions

- **Components**: One component per file, PascalCase filename, default export
- **State**: Zustand stores live in `context/` — use `create<T>()` pattern with interface
- **Hooks**: Custom hooks in `hooks/`, prefixed with `use`
- **Services**: Stateful service classes (singleton instances) in `services/`
- **Types**: Shared interfaces/types in `types/`
- **Styling**: Tailwind utility classes directly in JSX; reusable component classes defined in `index.css` under `@layer components`
- **Routing**: Flat route structure in App.tsx (`/` = main, `/list` = saved RCAs, `/reports` = reports, `/admin` = settings)

## Assets

- `public/` — Static assets served at root (company logo)
- `source/` — Reference RCA documents (PDF/DOCX examples, not part of the build)
