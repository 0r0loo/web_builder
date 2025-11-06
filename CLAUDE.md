# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern Next.js 16 application with React 19, TypeScript, Tailwind CSS v4, and Biome for linting/formatting. Uses React Compiler for automatic optimization.

**Backend & Database:**
- **Hosting**: Railway (앱 + DB 통합 배포)
- **Database**: PostgreSQL (Railway)
- **ORM**: Drizzle ORM (타입 안전한 SQL 쿼리)
- **API**: Next.js API Routes (RESTful)
- **Future**: WebSocket 서버 (실시간 협업용)

## Development Commands

### Core Development
```bash
# Start development server (http://localhost:3000)
yarn dev

# Production build
yarn build

# Start production server
yarn start

# Lint with Biome
yarn lint

# Format code with Biome
yarn format
```

### Package Management
- **Use yarn** (yarn.lock present)
- Install dependencies: `yarn install`
- Add dependency: `yarn add <package>`
- Add dev dependency: `yarn add -D <package>`

## Architecture

### Next.js App Router Structure
- **App Directory**: `src/app/` - Uses Next.js 15+ App Router architecture
- **Root Layout**: `src/app/layout.tsx` - Defines app-wide structure with Geist fonts
- **Pages**: Routes defined by directory structure (e.g., `src/app/page.tsx` = `/`)
- **Module Aliases**: `@/*` maps to `./src/*` (configured in tsconfig.json)

### Styling Architecture
- **Tailwind CSS v4**: PostCSS-based setup via `@tailwindcss/postcss`
- **Global Styles**: `src/app/globals.css`
- **Dark Mode**: Configured with `dark:` variant classes
- **Custom Fonts**: Geist Sans and Geist Mono via `next/font/google`

### TypeScript Configuration
- **Target**: ES2017
- **JSX**: `react-jsx` (React 19 automatic runtime)
- **Strict Mode**: Enabled
- **Module Resolution**: `bundler` mode for modern workflows

### React Compiler
- **Enabled**: `reactCompiler: true` in next.config.ts
- Automatically optimizes React components via babel-plugin-react-compiler
- No manual memoization (useMemo/useCallback) required in most cases

## Code Quality Tools

### Biome (Linter & Formatter)
- **Purpose**: Replaces ESLint and Prettier
- **Configuration**: `biome.json`
- **Domains**: Next.js and React specific rules enabled
- **Auto-organize imports**: Enabled on save
- **Format**: 2-space indentation

### Import Rules
- **Always use `import type`** for type-only imports (TypeScript/Vite optimization)
- Example: `import type { Metadata } from "next"`
- Use regular import only when value is used at runtime

## Framework Conventions

### Next.js Patterns
- **Server Components by default**: Components in `app/` are Server Components unless marked with `'use client'`
- **Metadata API**: Export `metadata` object for SEO (see layout.tsx:15)
- **Image Optimization**: Use `next/image` with priority prop for LCP images
- **Font Optimization**: Load fonts via `next/font` to prevent layout shift

### File Naming
- **Routes**: Use `page.tsx` for route pages
- **Layouts**: Use `layout.tsx` for nested layouts
- **Loading States**: Use `loading.tsx` for Suspense fallbacks
- **Error Handling**: Use `error.tsx` for error boundaries

## Project-Specific Notes

- Uses React 19.2.0 (stable release) with full concurrent features
- Tailwind v4 uses PostCSS plugin (different from v3 setup)
- No ESLint - Biome handles all linting/formatting
- Git VCS integration enabled in Biome configuration
