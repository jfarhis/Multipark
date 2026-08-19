# Gasfar Capital Investor Dashboard

A private investor portal for Gasfar Capital. Administrators manage projects, investors, ownership, distributions, and documents. Investors only see their own positions and permitted files.

## What is connected

- **Clerk** handles secure sign-in and invitations.
- **Neon Postgres** stores portfolio and account data.
- **Vercel Blob** stores uploaded documents privately.
- **Vercel** hosts the live application.

## Owner's first login

1. Open the live website and choose **Create account**.
2. Use `Joseph@gasfar.com` exactly. This email is recognized as the administrator.
3. Complete the email verification sent by Clerk.
4. You will be taken to the administrator dashboard.

## Everyday administrator workflow

- **Invite an investor:** open **Investors**, select **Invite investor**, and enter their name and email. They receive their own secure setup email.
- **Add a project:** open the bottom of **Overview** and expand **Add a project**.
- **Assign ownership:** open an investor and save their project percentages.
- **Upload a file:** open **Documents**, choose the project and optional investor, then upload. Files assigned to one investor remain visible only to that investor and administrators.
- **Export data:** use **Export report** or **Export CSV** to download a spreadsheet-ready file.

## Important data note

The database currently contains sample portfolio records used to prove the complete system. Replace these with Gasfar's real figures before inviting investors. The workbook importer remains available in `src/lib/data/excel-repository.ts` when the source Excel file is ready.

## Local development

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and fill in the connected service values. Never commit `.env.local`, passwords, tokens, or investor documents.

## Database commands

```bash
pnpm db:push
pnpm db:seed
```

`db:push` creates or updates the schema. `db:seed` loads the sample data and should not be run after production records replace it.
