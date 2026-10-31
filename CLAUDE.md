# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # ng serve — dev server at http://localhost:4200 (development config)
npm run build      # ng build — production build into dist/ (production is the default config)
npm run watch      # ng build --watch --configuration development
npx prettier --write <path>   # formatting (config in .prettierrc; no lint target exists)
```

**Tests are not wired up.** `package.json` has a `test` script and `tsconfig.spec.json` exists, but `angular.json` defines no `test` architect target and no test runner (Vitest/Karma) is installed, so `ng test` fails. All `ng generate` schematics are configured with `skipTests: true`, and there are no `*.spec.ts` files. Adding tests means first adding a `test` target and a runner.

## Stack

Angular 22 (standalone components, `@angular/build:application` builder), Angular Material 22 / CDK, `@microsoft/signalr`, TypeScript 6, npm.

## Architecture

`src/main.ts` bootstraps `App` (`src/app/app.ts`) with `appConfig` (`src/app/app.config.ts`). `App`'s template renders `<app-sidebar>`, a `<router-outlet>` inside `<main class="content">`, and `<app-toast>`.

- **Routes** are in `src/app/route/app.route.ts`: `''` redirects to `mail-sender`, the only page (`MailSender`).
- **Sidebar is `position: fixed`** and collapsed (80px) by default; it expands to 260px purely in CSS on `:hover` / keyboard focus, so there is no collapsed state in TypeScript. Main content placed beside it needs its own left offset, and reacting to collapse requires lifting that state out of `Sidebar`. Its "Sablon" link downloads the Excel template as `sablon.xlsx`.
- **Folders:** feature components in `src/app/components/<name>/`, shared UI in `src/app/shared/` (`Toast`), services in `src/app/core/service/`, interfaces in `src/app/model/`.
- **Toasts:** call `ToastService.show(message, 'success' | 'error')`; `App` renders the single `<app-toast>`.

## Mail flow

The backend is a separate ASP.NET Core project, not in this repo, at `https://localhost:7191`. URLs are hard-coded in `MailSenderService`; `MailStatusHubService` reads the base URL from `src/environments/environment.development.ts`. Its CORS policy must allow the `http://localhost:4200` origin with credentials, or the SignalR connection fails.

1. **Import:** choosing an Excel file (`.xlsx`/`.xls`) POSTs it to `/api/File/MessageData`, which returns `MailImportResult` (`isSucces`, `message`, `value`). `value` fills the grid; rows with `hasError` are highlighted and block sending through the `hasErrors` signal. Dropping a file only selects it; it does not trigger the import.
2. **Send:** "Transmite" calls `MailSender.SendMailMessages()`, which starts the SignalR connection to `/hubs/mail-status` through `MailStatusHubService.connect()` if needed, then POSTs the grid rows to `/api/MailDelivery/SendMailMessages?connectionId=<id>`. The `connectionId` comes from the live hub connection, never from a fixed value.
3. **Status:** the API emits a `MailStatus` event per message, exposed as `MailStatusHubService.mailStatus$`. The payload (`MailDeliveryResult`) is `{ request, success, error }` and has no field identifying the grid row, so updating the Status column needs the API to add one.

The POST response is plain text, not JSON, so the request must keep `responseType: 'text'`. It completes only after every message has been sent, and a 200 does not mean every message succeeded: per-message results are in `MailStatus`.

## Conventions

- Angular 22 file naming without type suffixes: `sidebar.ts` / `sidebar.html` / `sidebar.css` exporting class `Sidebar` (not `sidebar.component.ts` / `SidebarComponent`). Selector prefix is `app`.
- Component styles are plain CSS; only the Material theme is SCSS.
- Templates use built-in control flow (`@if`/`@for`), not `*ngIf`/`*ngFor`; component state is held in signals.
- Prettier: 100-char width, single quotes, `angular` parser for HTML.
- TypeScript is not in `strict` mode, but `noImplicitOverride`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`, and Angular's `strictInjectionParameters` / `strictInputAccessModifiers` are on.

## Styling

Two global stylesheets load in this order (`angular.json`): `src/material-theme.scss`, then `src/styles.css`.

- `material-theme.scss` applies `mat.theme()` (Material 3, azure primary / blue tertiary, Roboto, light scheme) and exposes `--mat-sys-*` CSS variables. Roboto and Material Symbols Outlined are loaded from Google Fonts in `src/index.html`.
- `styles.css` has a universal margin/padding/`box-sizing` reset and forces `body` to `#fff`, overriding the Material `--mat-sys-surface` background set in `material-theme.scss`.
- The sidebar uses hard-coded hex colors rather than Material tokens. Angular Material is used only in `MailSender` (`MatTable`, `MatProgressSpinner`).
- Production build budgets: component styles warn at 4kB and error at 8kB; initial bundle warns at 500kB and errors at 1MB.
