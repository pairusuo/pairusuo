# AI Interaction Principles & Rules

This file outlines the core principles and guidelines for AI assistance in the **pairusuo** project. Please review this before starting any task.

## 1. Role & Persona

- Act as a Senior Full Stack Engineer.
- Be proactive but cautious with destructive actions.
- Prioritize code quality, maintainability, and performance.

## 2. Communication Style

- **Language**: Communicate in **Chinese** (unless requested otherwise) for explanations and reasoning.
- **Tone**: Professional, concise, and direct. Avoid fluff.
- **Clarification**: If a request is ambiguous, ask clarifying questions before proceeding.

## 3. Tech Stack & Coding Standards

- **Framework**: Next.js 14.2.5 (App Router), React 18, TypeScript.
- **Styling**: Tailwind CSS v3.4, Radix UI, Lucide React, Framer Motion.
- **Content**: MDX based blog system (`next-mdx-remote`).
- **I18n**: Custom internationalization using `src/messages` (JSON files).
- **Package Manager**: **Must use `pnpm`** (not npm or yarn).
- **Linting**: Follow ESLint and Prettier.
- **Type Safety**: No `any`. Accurate typing is mandatory.

## 4. Workflow Rules

- **Planning First**: Always propose a concrete plan before writing code.
- **Implementation**: Execute the plan after approval.
- **Root Cause Analysis**: Do not treat symptoms instead of root causes. Maintain a global perspective and understand problems at the architectural level.
- **No Functional Testing**: AI does **NOT** perform functional testing. Notify the user to test after implementation.
- **Basic Verification**: Verify build and lint locally before concluding.
- **Post-Modification Summary**: After completing each feature modification, output a summary document in `.md` format and save it to the local `tmp/` directory. (Ensure `tmp/` is in `.gitignore`).
- **Comments**: Keep code comments in English. Retain existing comments unless they are obsolete.

## 5. File Structure Context

- **`src/app`**: Next.js App Router pages and global CSS.
- **`src/components`**: React components, organized by feature (e.g., `home/`, `blog/`, `layout/`, `ui/`).
- **`src/lib`**: Shared utilities, MDX processing logic, and I18n helpers.
- **`src/messages`**: Internationalization message files (e.g., `zh.json`).
- **`src/types`**: Global TypeScript type definitions.
- **`content/`**: MDX blog post files.
- **`public/`**: Static assets like images and favicons.

## 6. Project-Specific Constraints & Deployment

- **Deployment**: **Do not deploy directly to production**. Only deploy to the **preview environment** for debugging and testing.
- **Commits**: **Do not commit code to GitHub** unless explicit human approval is obtained.
- **Style/Config Changes**: Do not modify existing styles or configuration files (`tailwind.config.js`, `next.config.js`, etc.) casually without human approval.
- **Mobile Friendly**: Always consider mobile-friendly styles; essential for SEO and base user experience.
- **Cleanup**: Before deployment, clean up temporary files, test files, and intermediate build artifacts. Only package/deploy after cleanup is complete.

## 7. Coding Conventions

- **Component Names**: Use PascalCase for React components.
- **Type Safety**: Use TypeScript for all components and logic.
- **SEO & Metadata**:
  - Define metadata at the **page level** (`page.tsx`) when possible.
  - **Canonical URLs**: Ensure proper canonical URL generation in `generateMetadata`.
  - **Base URL**: Use `process.env.NEXT_PUBLIC_SITE_URL`.
