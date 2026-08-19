# Gasfar Capital Investor Dashboard

A premium dark-theme investor portal for managing real-estate projects, ownership stakes, distributions, and documents.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` and choose the administrator or investor demo workspace.

## Data integrations

- `src/lib/data/repository.ts` defines the swappable dashboard data interface.
- `src/lib/data/excel-repository.ts` reads the five workbook sheets described in the product brief.
- `src/lib/data/github-documents.ts` synchronizes files from a GitHub repository's `/receipts` folder.
- The current UI uses realistic mock data from `src/lib/mock-data.ts` until an `.xlsx` workbook is supplied.

## Environment variables

For private GitHub receipt sync, configure `GITHUB_TOKEN` and the target repository in the deployment environment. Never commit tokens or investor data to the repository.
