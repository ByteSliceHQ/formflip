---
name: micro-saas
description: |
  Bootstrap a complete micro-SaaS application powered by Swirls. Generates a full-stack app with TanStack Start, Better Auth, SQLite via Drizzle ORM, and the Swirls SDK for AI workflows, form handling, and infrastructure management.

  Use when the user wants to build a new micro-SaaS product, bootstrap a SaaS starter, or create a full-stack app that integrates with Swirls for AI-powered workflows. Feed in a product idea and get a complete, deployable application scaffold.
user-invocable: true
allowed-tools: [Bash, Read, Write, Edit]
metadata:
  last_verified: "2026-02-15"
  repository: "https://github.com/byteslicehq/swirls"
  documentation: "https://swirls.ai/docs"
  sdk_reference: "https://swirls.ai/docs/docs/references/sdk"
---

# Micro SaaS Bootstrapper

Build a complete micro-SaaS application powered by Swirls. This skill generates a production-ready full-stack app from a product idea using TanStack Start, Better Auth, SQLite, and the Swirls SDK.

**Stack:**

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [TanStack Start](https://tanstack.com/start) (full-stack React with SSR)
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based, type-safe)
- **Auth**: [Better Auth](https://www.better-auth.com/) (email/password, OAuth, sessions)
- **Database**: SQLite via [Drizzle ORM](https://orm.drizzle.team/) (local `bun:sqlite`)
- **Validation**: [Zod](https://zod.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **AI Workflows**: [Swirls SDK](https://swirls.ai) (forms, graph execution, data streams)

---

## Table of Contents

- [How to Use This Skill](#how-to-use-this-skill)
- [Project Scaffold](#project-scaffold)
- [Step 1: Initialize the Project](#step-1-initialize-the-project)
- [Step 2: Configure Swirls](#step-2-configure-swirls)
- [Step 3: Database Schema](#step-3-database-schema)
- [Step 4: Authentication](#step-4-authentication)
- [Step 5: Server Functions](#step-5-server-functions)
- [Step 6: Routes and Pages](#step-6-routes-and-pages)
- [Step 7: Swirls SDK Integration](#step-7-swirls-sdk-integration)
- [Step 8: Deployment](#step-8-deployment)
- [Swirls SDK Reference](#swirls-sdk-reference)
- [Swirls CLI Reference](#swirls-cli-reference)
- [Patterns and Best Practices](#patterns-and-best-practices)

---

## How to Use This Skill

When the user provides a micro-SaaS idea, follow these steps:

1. **Understand the idea**: Identify the core domain entities, user flows, and what Swirls features the app needs (forms, workflows, webhooks, schedules, AI agents, data streams).
2. **Design the schema**: Map domain entities to Drizzle ORM SQLite tables, plus the standard Better Auth tables.
3. **Plan Swirls integration**: Determine which Swirls resources to create (forms with JSON schemas, workflow graphs, triggers, webhooks, schedules, streams) and how they connect to the app.
4. **Generate the scaffold**: Create the full project structure following the patterns below.
5. **Wire up the SDK**: Initialize the Swirls config, run code generation, and integrate form adapters and graph executions into the app.

**Important**: The Swirls platform handles AI workflow orchestration externally. The app you build is the *frontend and user-facing layer* that submits data to Swirls (via forms, webhooks, or SDK calls) and reads results back (via streams, executions, or graph outputs). Do NOT try to replicate workflow logic inside the app. Let Swirls handle it.

---

## Project Scaffold

Generate this directory structure for every new micro-SaaS project:

```
my-saas/
├── src/
│   ├── components/
│   │   ├── AuthComponents.tsx      # SignedIn, SignedOut, UserButton wrappers
│   │   ├── Header.tsx              # Navigation with auth UI
│   │   └── ...                     # Domain-specific components
│   ├── db/
│   │   ├── schema.ts               # Drizzle ORM table definitions
│   │   └── client.ts               # Database client factory
│   ├── lib/
│   │   ├── auth.ts                 # Better Auth server configuration
│   │   ├── auth-client.ts          # Better Auth client (React hooks)
│   │   └── swirls.ts               # Swirls SDK client (server-side)
│   ├── routes/
│   │   ├── __root.tsx              # Root layout (HTML shell, Header, Outlet)
│   │   ├── index.tsx               # Landing page
│   │   ├── sign-in.tsx             # Sign-in form
│   │   ├── sign-up.tsx             # Sign-up form
│   │   ├── dashboard.tsx           # Protected dashboard
│   │   ├── pricing.tsx             # Pricing page (optional)
│   │   └── api/
│   │       └── auth/
│   │           └── $.ts            # Better Auth catch-all handler
│   ├── server/
│   │   └── [domain].ts             # Server functions for each domain entity
│   ├── router.tsx                  # TanStack Router instance
│   ├── start.ts                    # TanStack Start instance
│   ├── swirls.gen.ts               # Generated Swirls SDK types (auto-generated)
│   └── styles.css                  # Tailwind CSS imports
├── drizzle/                        # Generated migrations
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── swirls.config.ts                # Swirls SDK configuration
├── biome.json                      # Linter/formatter config
├── Dockerfile
├── .env.example
└── .gitignore
```

---

## Step 1: Initialize the Project

### package.json

```json
{
  "name": "my-saas",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev --port 3000",
    "build": "vite build",
    "start": "bun .output/server/index.mjs",
    "preview": "vite preview",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "swirls:gen": "swirls dev gen"
  },
  "dependencies": {
    "@swirls/sdk": "^0.0.4",
    "@tailwindcss/vite": "^4.0.6",
    "@tanstack/react-devtools": "^0.7.0",
    "@tanstack/react-query": "^5.90.0",
    "@tanstack/react-router": "^1.132.0",
    "@tanstack/react-router-devtools": "^1.132.0",
    "@tanstack/react-start": "^1.132.0",
    "@tanstack/router-plugin": "^1.132.0",
    "better-auth": "^1.4.18",
    "drizzle-orm": "^0.45.1",
    "lucide-react": "^0.561.0",
    "nitro": "npm:nitro-nightly@latest",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "tailwindcss": "^4.0.6",
    "vite-tsconfig-paths": "^6.0.2",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@biomejs/biome": "2.2.4",
    "@tanstack/devtools-vite": "^0.3.11",
    "@types/node": "^22.10.2",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.0.4",
    "drizzle-kit": "^0.31.8",
    "typescript": "^5.7.2",
    "vite": "^7.1.7"
  }
}
```

### vite.config.ts

```typescript
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { devtools } from "@tanstack/devtools-vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    devtools(),
    nitro({ preset: "bun" }),
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
```

### tsconfig.json

```json
{
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "sqlite.db",
  },
});
```

### .env.example

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Swirls
SWIRLS_API_KEY=ak_your-swirls-api-key
```

### swirls.config.ts

```typescript
import { defineConfig } from "@swirls/sdk/config";

export default defineConfig({
  projectId: "your-swirls-project-id", // UUID from Swirls dashboard
  genPath: "src/swirls.gen.ts",
});
```

### biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
  "vcs": { "enabled": false },
  "files": {
    "includes": ["**/src/**/*", "**/.vscode/**/*", "**/index.html", "**/vite.config.ts"],
    "ignores": ["**/src/routeTree.gen.ts", "**/src/swirls.gen.ts", "**/src/styles.css"]
  },
  "formatter": { "enabled": true, "indentStyle": "tab" },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "javascript": { "formatter": { "quoteStyle": "double" } }
}
```

---

## Step 2: Configure Swirls

### Initialize Swirls in the Project

```bash
# Login to Swirls (opens browser OAuth)
swirls auth login

# Initialize config file
swirls dev init

# After creating forms/graphs in the Swirls dashboard, generate types:
swirls dev gen
```

### Generated Code (src/swirls.gen.ts)

The `swirls dev gen` command fetches your project's forms from the Swirls API and generates a type-safe TypeScript file. This file contains:

- Zod schemas for each form
- A typed form registry
- A `registerForms()` function to call at app startup
- Module augmentation for the `FormRegistry` interface

**Example generated output:**

```typescript
// AUTO-GENERATED by @swirls/cli - DO NOT EDIT
import { z } from "zod";
import { registerForm } from "@swirls/sdk/form";

// Form: Contact Form
const contactFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
});

// Form: Feedback Form
const feedbackFormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

declare module "@swirls/sdk/form" {
  interface FormRegistry {
    "contact-form": {
      id: "form-uuid-here";
      schema: typeof contactFormSchema;
    };
    "feedback-form": {
      id: "form-uuid-here";
      schema: typeof feedbackFormSchema;
    };
  }
}

export function registerForms() {
  registerForm("contact-form", {
    id: "form-uuid-here",
    schema: contactFormSchema,
  });
  registerForm("feedback-form", {
    id: "form-uuid-here",
    schema: feedbackFormSchema,
  });
}
```

### Register Forms at App Startup

In the root layout or entry point, call `registerForms()`:

```typescript
// src/routes/__root.tsx
import { registerForms } from "@/swirls.gen";

// Register Swirls forms on app boot
registerForms();
```

---

## Step 3: Database Schema

### src/db/client.ts

```typescript
import * as schema from "./schema";

const createDb = async () => {
  // Local SQLite with Bun
  const { Database } = await import("bun:sqlite");
  const { drizzle } = await import("drizzle-orm/bun-sqlite");
  const sqlite = new Database("sqlite.db");
  sqlite.run("PRAGMA journal_mode = WAL;");
  sqlite.run("PRAGMA foreign_keys = ON;");
  return drizzle({ client: sqlite, schema });
};

export const db = await createDb();
```

### src/db/schema.ts

Every micro-SaaS needs the Better Auth tables plus domain-specific tables. Below is the base schema. **Add your domain tables after the auth section**.

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// ============================================================
// Better Auth Tables (REQUIRED - do not modify column names)
// ============================================================

export const user = sqliteTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const session = sqliteTable("session", {
  id: text().primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text().notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const account = sqliteTable("account", {
  id: text().primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text(),
  password: text(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const verification = sqliteTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// ============================================================
// Domain Tables (ADD YOUR TABLES HERE)
// ============================================================
// Example pattern for a domain entity:
//
// export const items = sqliteTable("items", {
//   id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
//   userId: text("user_id").notNull(),
//   name: text().notNull(),
//   description: text(),
//   createdAt: integer("created_at", { mode: "timestamp_ms" })
//     .notNull()
//     .default(sql`(strftime('%s', 'now') * 1000)`),
//   updatedAt: integer("updated_at", { mode: "timestamp_ms" })
//     .notNull()
//     .default(sql`(strftime('%s', 'now') * 1000)`)
//     .$onUpdate(() => new Date()),
// });
//
// export const itemsRelations = relations(items, ({ many }) => ({
//   children: many(childTable),
// }));
//
// export type Item = typeof items.$inferSelect;
// export type NewItem = typeof items.$inferInsert;
```

---

## Step 4: Authentication

### src/lib/auth.ts (Server)

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db/client";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
});
```

### src/lib/auth-client.ts (Client)

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
```

### src/components/auth.tsx

```typescript
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";

export function SignedIn({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  if (!session?.user) return null;
  return <>{children}</>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return null;
  if (session?.user) return null;
  return <>{children}</>;
}

export function UserButton() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  if (!session?.user) return null;

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-300">{session.user.name}</span>
      <button
        onClick={handleSignOut}
        className="rounded-md bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600"
      >
        Sign out
      </button>
    </div>
  );
}
```

### Auth API Route (src/routes/api/auth/$.ts)

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
```

### Auth Middleware (enforces auth for all server functions that use it)

```typescript
// src/lib/auth-guard.ts
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";

// Middleware that enforces authentication and injects userId into context
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect({ to: "/" });
  }
  return next({ context: { userId: session.user.id } });
});

// Pre-authenticated server function factory — use this instead of createServerFn
// for any endpoint that requires a logged-in user. Auth is enforced automatically
// and context.userId is always available in the handler.
export const authedFn = (opts: { method: "GET" | "POST" }) =>
  createServerFn(opts).middleware([authMiddleware]);
```

### Sign-In Page (src/routes/sign-in.tsx)

```typescript
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.message ?? "Sign in failed");
      return;
    }

    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold">Sign In</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full rounded border p-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full rounded border p-2"
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
```

### Sign-Up Page (src/routes/sign-up.tsx)

```typescript
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error } = await authClient.signUp.email({ name, email, password });

    if (error) {
      setError(error.message ?? "Sign up failed");
      return;
    }

    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="w-full rounded border p-2"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full rounded border p-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full rounded border p-2"
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
```

---

## Step 5: Server Functions

Server functions are the RPC layer. They run on the server and are callable from client components as regular async functions. Always use `authedFn()` instead of bare `createServerFn()` for any endpoint that requires a logged-in user — this enforces authentication via middleware so it cannot be forgotten.

### Pattern: Domain CRUD Server Functions

**IMPORTANT**: Always use `authedFn` from `@/lib/auth-guard` instead of bare `createServerFn` for any endpoint that accesses user data. This enforces authentication via middleware — the `context.userId` is guaranteed to be the authenticated user's ID. There is no way to accidentally forget the auth check.

```typescript
// src/server/[domain].ts
import { z } from "zod";
import { db } from "@/db/client";
import { items } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { authedFn } from "@/lib/auth-guard";

// READ - List items for the authenticated user
export const getItems = authedFn({ method: "GET" }).handler(
  async ({ context }) => {
    return db.query.items.findMany({
      where: eq(items.userId, context.userId),
      orderBy: [asc(items.createdAt)],
    });
  }
);

// CREATE - Add a new item
export const createItem = authedFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    })
  )
  .handler(async ({ context, data }) => {
    const [newItem] = await db
      .insert(items)
      .values({
        userId: context.userId,
        name: data.name,
        description: data.description,
      })
      .returning();
    return newItem;
  });

// UPDATE - Modify an existing item (ownership check)
export const updateItem = authedFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
    })
  )
  .handler(async ({ context, data }) => {
    const existing = await db.query.items.findFirst({
      where: eq(items.id, data.id),
    });
    if (!existing || existing.userId !== context.userId) return null;

    const [updated] = await db
      .update(items)
      .set({ name: data.name, description: data.description })
      .where(eq(items.id, data.id))
      .returning();
    return updated;
  });

// DELETE - Remove an item (ownership check)
export const deleteItem = authedFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    const existing = await db.query.items.findFirst({
      where: eq(items.id, data.id),
    });
    if (!existing || existing.userId !== context.userId) return null;
    await db.delete(items).where(eq(items.id, data.id));
    return { success: true };
  });
```

---

## Step 6: Routes and Pages

### Root Layout (src/routes/__root.tsx)

Use `createRootRouteWithContext<RouterContext>()` so child route loaders can access `queryClient` for TanStack Query:

```typescript
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { RouterContext } from "@/router";
import { Header } from "@/components/Header";
import { registerForms } from "@/swirls.gen";
import appCss from "@/styles.css?url";

// Register Swirls forms at app boot
registerForms();

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "My SaaS App" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-gray-950 text-white">
        <Header />
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

### Router Instance (src/router.tsx)

Provide a `QueryClient` in router context so route loaders can use `ensureQueryData` and components can use `useSuspenseQuery`:

```typescript
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export type RouterContext = {
  queryClient: QueryClient;
};

export function getRouter() {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

### TanStack Start Instance (src/start.ts)

```typescript
import { createStart } from "@tanstack/react-start";

export const startInstance = createStart(() => ({}));
```

### Protected Dashboard Route (src/routes/dashboard.tsx)

Use TanStack Query in loaders and components so route transitions trigger the loader promise (e.g. for a navigation progress bar) and data is cached:

```typescript
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { getItems } from "@/server/items";

const authGuard = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect({ to: "/" });
  }
  return { userId: session.user.id };
});

const itemsQueryOptions = queryOptions({
  queryKey: ["items"],
  queryFn: () => getItems(),
});

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => authGuard(),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(itemsQueryOptions),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: items } = useSuspenseQuery(itemsQueryOptions);

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      {/* Render your domain UI here */}
    </main>
  );
}
```

### Styles (src/styles.css)

```css
@import "tailwindcss";
```

---

## Step 7: Swirls SDK Integration

The Swirls SDK connects your app to the Swirls platform for AI workflows, form handling, and data persistence.

### Using the Form Adapter (React Hook)

After running `swirls dev gen`, use the `useSwirlsFormAdapter` hook to submit data to Swirls forms:

```typescript
import { useSwirlsFormAdapter } from "@swirls/sdk/form";

function ContactForm() {
  const adapter = useSwirlsFormAdapter("contact-form", {
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await adapter.submit({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    });

    // result.executionIds contains IDs of triggered graph executions
    console.log("Submitted:", result.executionIds);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Form Submission Flow

When you call `adapter.submit(data)`:

1. The SDK validates data against the form's Zod schema
2. Submits the data to Swirls via the SDK client
3. Swirls triggers any connected workflow graphs
4. Returns `{ message: string, executionIds: string[] }`

### Swirls SDK Client (Server-Side)

The `@swirls/sdk/client` export provides a typed `Swirls` class with an oRPC client. Initialize it once and use it across all server functions — never make raw `fetch` calls to the Swirls API.

```typescript
// src/lib/swirls.ts
import { Swirls } from "@swirls/sdk/client";

export const swirls = new Swirls({
  apiKey: process.env.SWIRLS_API_KEY!,
});
```

### Using the SDK in Server Functions

Use `swirls.client` to call any Swirls API method with full type safety. The client mirrors the API structure (`graphs.*`, `streams.*`, `forms.*`, etc.).

```typescript
// src/server/swirls.ts
import { z } from "zod";
import { authedFn } from "@/lib/auth-guard";
import { swirls } from "@/lib/swirls";

// Execute a workflow graph
export const executeWorkflow = authedFn({ method: "POST" })
  .inputValidator(z.object({ graphId: z.string(), input: z.record(z.any()) }))
  .handler(async ({ data }) => {
    return swirls.client.graphs.executeGraph({
      graphId: data.graphId,
      input: data.input,
    });
  });

// Query a data stream
export const queryStream = authedFn({ method: "POST" })
  .inputValidator(
    z.object({
      projectId: z.string(),
      streamId: z.string(),
      filters: z.array(z.object({
        column: z.string(),
        operator: z.enum(["eq", "ne", "gt", "lt", "gte", "lte", "like", "in"]),
        value: z.any(),
      })).optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    return swirls.client.streams.executeStreamQuery({
      projectId: data.projectId,
      streamId: data.streamId,
      filters: data.filters,
      limit: data.limit,
      offset: data.offset,
    });
  });

// Get execution status
export const getExecution = authedFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    return swirls.client.graphs.getExecution({
      id: data.id,
    });
  });
```

---

## Step 8: Deployment

### Dockerfile

```dockerfile
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-slim AS production
WORKDIR /app

COPY --from=build /app/.output ./.output

ENV BETTER_AUTH_SECRET=""
ENV BETTER_AUTH_URL=""
ENV SWIRLS_API_KEY=""

EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
```

### Build and Run

```bash
# Development
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Database operations
bun run db:push      # Push schema to database (development)
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations (production)

# Swirls code generation
bun run swirls:gen   # Regenerate types after updating forms in Swirls
```

---

## Swirls SDK Reference

> **Official SDK docs**: https://swirls.ai/docs/docs/references/sdk
> For the latest method signatures and types, always refer to the official documentation.

**Always use the SDK client for all Swirls operations.** Never make raw `fetch` calls to the Swirls API. The SDK (`@swirls/sdk`) is a type-safe TypeScript client that wraps the oRPC contract with a simple interface for managing projects, graphs, triggers, and all other Swirls resources.

### Installation

```bash
bun add @swirls/sdk
```

### Client (`@swirls/sdk/client`)

The `Swirls` class is the primary way to interact with the Swirls platform from server-side code. Initialize it once and reuse across all server functions.

```typescript
import { Swirls } from "@swirls/sdk/client";

const swirls = new Swirls({
  apiKey: process.env.SWIRLS_API_KEY!, // Format: ak_*
  apiUrl: "https://swirls.ai/api",     // Optional, this is the default
});

// All methods are available on swirls.client.<namespace>.<method>(input)
// The client is fully typed — autocomplete and type errors guide usage.
```

### Client Methods

All methods below are called as `swirls.client.<namespace>.<method>({ ... })`. All inputs and outputs are fully typed. For full parameter details, see the [official SDK reference](https://swirls.ai/docs/docs/references/sdk).

#### Projects ([docs](https://swirls.ai/docs/docs/references/sdk/projects))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `projects.listProjects()` | — | List all accessible projects |
| `projects.createProject({ name })` | `name` (required) | Create a new project |
| `projects.getProject({ projectId })` | `projectId` (required) | Get project details |
| `projects.getStorage({ projectId })` | `projectId` (required) | Get project storage config |
| `projects.createStorage({ projectId, region })` | `projectId` (required), `region`: `"americas"` \| `"emea"` \| `"apac"` (required) | Provision storage for project |

#### Folders ([docs](https://swirls.ai/docs/docs/references/sdk/folders))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `folders.createFolder({ projectId, name })` | `projectId`, `name` (required); `id` (optional) | Create folder for organizing resources |
| `folders.getFolder({ id })` | `id` (required) | Get folder by ID |
| `folders.updateFolder({ id, name })` | `id` (required); `name` (optional) | Update folder |
| `folders.deleteFolder({ id })` | `id` (required) | Delete folder |
| `folders.listFolders({ projectId })` | `projectId` (required); `pagination` (optional) | List folders in project |

#### Forms ([docs](https://swirls.ai/docs/docs/references/sdk/forms))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `forms.createForm({ projectId, name, label })` | `projectId`, `name`, `label` (required); `description`, `schema`, `folderId`, `id`, `enabled` (optional) | Create form with optional JSON Schema |
| `forms.getForm({ id })` | `id` (required) | Get form by ID |
| `forms.updateForm({ id })` | `id` (required); `name`, `description`, `schema`, `enabled`, `folderId` (optional) | Update form |
| `forms.deleteForm({ id })` | `id` (required) | Delete form |
| `forms.listForms({ projectId })` | `projectId` (required); `folderId`, `pagination` (optional) | List forms in project |
| `forms.listFormSubmissions({ formId })` | `formId` (required); `pagination` (optional) | List submissions for a form |
| `forms.listTriggersForForm({ formId })` | `formId` (required); `pagination` (optional) | List triggers connected to form |

**Form Schema**: Forms accept a JSON Schema (JSON Schema 7) defining the expected input. When submitted via the SDK form adapter, data is validated against this schema.

#### Workflow Graphs ([docs](https://swirls.ai/docs/docs/references/sdk/graphs))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `graphs.createGraph({ projectId, name, label })` | `projectId`, `name`, `label` (required); `folderId`, `description`, `id` (optional) | Create a workflow graph |
| `graphs.getGraph({ id })` | `id` (required) | Get graph with all nodes, edges, and layout |
| `graphs.updateGraph({ id })` | `id` (required); `name`, `description`, `folderId` (optional) | Update graph metadata |
| `graphs.deleteGraph({ id })` | `id` (required) | Delete a graph |
| `graphs.listGraphs({ projectId })` | `projectId` (required); `folderId`, `pagination` (optional) | List graphs in project |
| `graphs.createNode({ graphId, name, label, type, config })` | `graphId`, `name`, `label`, `type`, `config` (required); `position`, `description`, `reviewConfig`, `outputSchema`, `inputSchema` (optional) | Add node to graph |
| `graphs.updateNode({ id })` | `id` (required); `type`, `name`, `label`, `description`, `config`, `position`, `reviewConfig`, `outputSchema`, `inputSchema` (optional) | Update node config/position |
| `graphs.deleteNode({ id })` | `id` (required) | Remove node |
| `graphs.createEdge({ graphId, sourceNodeId, targetNodeId })` | `graphId`, `sourceNodeId`, `targetNodeId` (required); `label` (optional) | Connect two nodes (no cycles allowed) |
| `graphs.deleteEdge({ id })` | `id` (required) | Disconnect nodes |
| `graphs.syncGraph({ graphId, nodes, edges })` | `graphId`, `nodes[]`, `edges[]` (required) | Bulk update all nodes and edges at once |
| `graphs.executeGraph({ graphId })` | `graphId` (required); `input` (optional) | Execute graph, returns `{ executionId }` |
| `graphs.getExecution({ id })` | `id` (required) | Get execution status, output, nodeExecutions |
| `graphs.listExecutions({ graphId })` | `graphId` (required); `pagination` (optional) | List past executions |
| `graphs.listTriggers({ graphId })` | `graphId` (required); `pagination` (optional) | List triggers for a graph |
| `graphs.getStream({ graphId })` | `graphId` (required) | Get stream associated with graph |

**Node Types**:

| Type | Description | Key Config |
|------|-------------|------------|
| `llm` | Language model call | model, prompt, temperature, maxTokens |
| `http` | HTTP request | url, method, headers, body |
| `code` | JavaScript execution | code (string) |
| `switch` | Conditional branch | expression |
| `document` | Read document content | documentId |
| `email` | Send email | to, subject, body |
| `graph` | Execute sub-graph | graphId |
| `scrape` | Web scraping | url, selector |
| `stream` | Query data stream | streamId, query |
| `wait` | Delay execution | duration |
| `bucket` | File storage ops | action (download/upload), path |

**Graph Layout Tips**: Position nodes left-to-right with ~150-200px horizontal spacing. Avoid overlapping. Call `getGraph` first to inspect existing positions before adding nodes.

#### Triggers ([docs](https://swirls.ai/docs/docs/references/sdk/triggers))

Triggers connect resources (forms, webhooks, schedules, agents) to graphs.

| Method | Parameters | Description |
|--------|-----------|-------------|
| `triggers.createTrigger({ projectId, graphId, resourceType, resourceId })` | `projectId`, `graphId`, `resourceType`, `resourceId` (required); `id`, `enabled` (optional) | Create trigger linking resource to graph |
| `triggers.getTrigger({ id })` | `id` (required) | Get trigger by ID |
| `triggers.updateTrigger({ id })` | `id` (required); `resourceId`, `graphId`, `enabled` (optional) | Update trigger config |
| `triggers.deleteTrigger({ id })` | `id` (required) | Delete trigger |
| `triggers.listTriggers({ projectId })` | `projectId` (required); `graphId`, `resourceId`, `pagination` (optional) | List triggers in project |
| `triggers.listSchemaIncompatibilities({ projectId })` | `projectId` (required); `pagination` (optional) | Find schema mismatches |
| `triggers.executeTriggers({ resourceId })` | `resourceId` (required); `resourceType`, `input` (optional) | Manually fire all enabled triggers for a resource. Returns `{ executionIds: string[] }` |

**Resource Types**: `form`, `webhook`, `schedule`, `agent`

#### Webhooks ([docs](https://swirls.ai/docs/docs/references/sdk/webhooks))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `webhooks.createWebhook({ projectId, name, label })` | `projectId`, `name`, `label` (required); `description`, `schema`, `folderId`, `id`, `enabled` (optional) | Create webhook endpoint |
| `webhooks.getWebhook({ id })` | `id` (required) | Get webhook by ID |
| `webhooks.updateWebhook({ id })` | `id` (required); `name`, `description`, `schema`, `enabled`, `folderId` (optional) | Update webhook |
| `webhooks.deleteWebhook({ id })` | `id` (required) | Delete webhook |
| `webhooks.listWebhooks({ projectId })` | `projectId` (required); `folderId`, `pagination` (optional) | List webhooks in project |
| `webhooks.listTriggersForWebhook({ webhookId })` | `webhookId` (required); `pagination` (optional) | List triggers for webhook |

#### Schedules ([docs](https://swirls.ai/docs/docs/references/sdk/schedules))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `schedules.createSchedule({ projectId, name, label, cron })` | `projectId`, `name`, `label`, `cron` (required); `id`, `folderId`, `description`, `timezone`, `enabled` (optional) | Create cron schedule |
| `schedules.getSchedule({ id })` | `id` (required) | Get schedule (includes `nextRunAt`, `running`) |
| `schedules.updateSchedule({ id })` | `id` (required); `name`, `description`, `cron`, `timezone`, `enabled`, `folderId` (optional) | Update schedule |
| `schedules.deleteSchedule({ id })` | `id` (required) | Delete schedule |
| `schedules.listSchedules({ projectId })` | `projectId` (required); `folderId`, `pagination` (optional) | List schedules in project |
| `schedules.listTriggersForSchedule({ scheduleId })` | `scheduleId` (required); `pagination` (optional) | List triggers for schedule |

#### Agents ([docs](https://swirls.ai/docs/docs/references/sdk/agents))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `agents.createAgent({ projectId, name, label, prompt })` | `projectId`, `name`, `label`, `prompt` (required); `id`, `folderId`, `description`, `toolTriggerIds` (optional) | Create AI agent with system prompt and tools |
| `agents.getAgent({ id })` | `id` (required) | Get agent with its tools |
| `agents.updateAgent({ id })` | `id` (required); `name`, `description`, `prompt`, `folderId`, `toolTriggerIds` (optional) | Update agent |
| `agents.deleteAgent({ id })` | `id` (required) | Delete agent |
| `agents.listAgents({ projectId })` | `projectId` (required); `folderId`, `pagination` (optional) | List agents in project |

#### Documents ([docs](https://swirls.ai/docs/docs/references/sdk/documents))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `documents.createDocument({ projectId, name, label })` | `projectId`, `name`, `label` (required); `id`, `folderId`, `description`, `content` (optional) | Create document for use in document nodes |
| `documents.getDocument({ id })` | `id` (required) | Get document by ID |
| `documents.updateDocument({ id })` | `id` (required); `name`, `description`, `content`, `folderId` (optional) | Update document |
| `documents.deleteDocument({ id })` | `id` (required) | Delete document |
| `documents.listDocuments({ projectId })` | `projectId` (required); `folderId`, `pagination` (optional) | List documents in project |

#### Data Streams ([docs](https://swirls.ai/docs/docs/references/sdk/streams))

Streams persist data from graph executions for querying. Use a `persistenceCondition` (JavaScript expression) to control when results are stored.

| Method | Parameters | Description |
|--------|-----------|-------------|
| `streams.createStream({ projectId, graphId, name, persistenceCondition })` | `projectId`, `graphId`, `name`, `persistenceCondition` (required); `description`, `enabled`, `id` (optional) | Create data stream |
| `streams.getStream({ id })` | `id` (required) | Get stream by ID |
| `streams.updateStream({ id })` | `id` (required); `name`, `description`, `persistenceCondition`, `enabled` (optional) | Update stream |
| `streams.deleteStream({ id })` | `id` (required) | Delete stream |
| `streams.listStreams({ projectId })` | `projectId` (required); `pagination` (optional) | List streams in project |
| `streams.listStreamSchemas({ streamId })` | `streamId` (required); `pagination` (optional) | List inferred schema versions |
| `streams.promoteStreamSchema({ streamId, schemaVersion, includedColumns })` | `streamId`, `schemaVersion`, `includedColumns[]` (required) | Activate a schema version |
| `streams.listStreamTableColumns({ projectId, streamId })` | `projectId`, `streamId` (required) | Get column definitions |
| `streams.getStreamTableSchema({ projectId, streamId })` | `projectId`, `streamId` (required) | Get table schema |
| `streams.executeStreamQuery({ projectId, streamId })` | `projectId`, `streamId` (required); `filters[]`, `limit`, `offset` (optional) | Query stream data. Returns `{ columns, rows }` |

**Stream Query Filters**: Each filter has `column` (string), `operator` (`eq`|`ne`|`gt`|`lt`|`gte`|`lte`|`like`|`in`), and `value` (any).

**Tip**: Call `getStreamTableSchema` or `listStreamTableColumns` first to discover available columns before querying.

#### Schemas ([docs](https://swirls.ai/docs/docs/references/sdk/schemas))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `schemas.createSchema({ projectId, name, label })` | `projectId`, `name`, `label` (required); `id`, `folderId`, `description`, `schema` (optional) | Register a reusable JSON Schema |
| `schemas.getSchema({ id })` | `id` (required) | Get schema by ID |
| `schemas.updateSchema({ id })` | `id` (required); `name`, `description`, `schema`, `folderId` (optional) | Update schema |
| `schemas.deleteSchema({ id })` | `id` (required) | Delete schema |
| `schemas.listSchemas({ projectId })` | `projectId` (required); `folderId`, `pagination` (optional) | List schemas in project |
| `schemas.searchSchemaCandidates({ projectId })` | `projectId` (required); `query`, `excludeGraphId`, `excludeNodeId`, `limit` (optional) | Search for reusable schemas |

#### Secrets ([docs](https://swirls.ai/docs/docs/references/sdk/secrets))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `secrets.createSecret({ projectId, key, value })` | `projectId`, `key`, `value` (required); `sensitive` (optional) | Store encrypted secret |
| `secrets.getSecretValue({ projectId, secretId })` | `projectId`, `secretId` (required) | Retrieve secret value |
| `secrets.updateSecret({ projectId, secretId })` | `projectId`, `secretId` (required); `key`, `value`, `sensitive` (optional) | Update secret |
| `secrets.deleteSecret({ projectId, secretId })` | `projectId`, `secretId` (required) | Delete secret |
| `secrets.listSecrets({ projectId })` | `projectId` (required) | List secrets (values masked) |

#### File Buckets ([docs](https://swirls.ai/docs/docs/references/sdk/buckets))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `buckets.createBucket({ projectId })` | `projectId` (required); `bucketName`, `public`, `fileSizeLimit` (optional) | Create storage bucket |
| `buckets.listFiles({ projectId })` | `projectId` (required); `path`, `limit`, `offset` (optional) | List files and folders |
| `buckets.deleteFile({ projectId, path })` | `projectId`, `path` (required) | Delete a file |
| `buckets.deleteFiles({ projectId, paths })` | `projectId`, `paths[]` (required) | Batch delete files. Returns `{ deleted[], failed[] }` |
| `buckets.createSignedUrl({ projectId, path })` | `projectId`, `path` (required); `expiresIn` (optional) | Get download URL |
| `buckets.createSignedUploadUrl({ projectId, path })` | `projectId`, `path` (required) | Get upload URL with token |
| `buckets.moveFile({ projectId, sourcePath, destinationPath })` | `projectId`, `sourcePath`, `destinationPath` (required) | Move/rename file |
| `buckets.copyFile({ projectId, sourcePath, destinationPath })` | `projectId`, `sourcePath`, `destinationPath` (required) | Copy file |

#### API Keys ([docs](https://swirls.ai/docs/docs/references/sdk/api-keys))

| Method | Parameters | Description |
|--------|-----------|-------------|
| `apiKeys.createApiKey({ name })` | `name` (required); `description`, `scopes[]`, `expiresInDays` (optional) | Create API key (secret returned once — save it) |
| `apiKeys.listApiKeys({})` | `includeRevoked` (optional) | List API keys |
| `apiKeys.revokeApiKey({ apiKeyId })` | `apiKeyId` (required); `reason` (optional) | Revoke an API key (irreversible) |

#### Reviews ([docs](https://swirls.ai/docs/docs/references/sdk/reviews))

Human-in-the-loop approval workflow. Reviews are created when graph nodes with `reviewConfig` pause execution.

| Method | Parameters | Description |
|--------|-----------|-------------|
| `reviews.listReviews({ projectId })` | `projectId` (required); `status` (`"pending"` \| `"approved"` \| `"rejected"`), `pagination` (optional) | List reviews |
| `reviews.getReview({ id })` | `id` (required) | Get review with execution details |
| `reviews.approveReview({ id })` | `id` (required); `formData` (optional) | Approve to continue graph execution |
| `reviews.rejectReview({ id })` | `id` (required); `reason` (optional) | Reject to stop graph execution |

#### Storage ([docs](https://swirls.ai/docs/docs/references/sdk/storage))

Manage saved SQL queries and execute them against project storage.

| Method | Parameters | Description |
|--------|-----------|-------------|
| `storage.createQuery({ projectId, name, sql })` | `projectId`, `name`, `sql` (required) | Save a SQL query |
| `storage.executeQuery({ projectId, sql })` | `projectId`, `sql` (required) | Execute SQL query. Returns `{ columns, rows }` |
| `storage.listQueries({ projectId })` | `projectId` (required) | List saved queries |
| `storage.getQuery({ id })` | `id` (required) | Get query by ID |
| `storage.updateQuery({ id })` | `id` (required); `name`, `sql` (optional) | Update query |
| `storage.deleteQuery({ id })` | `id` (required) | Delete query |

### Pagination

All list methods support cursor-based pagination:

```typescript
swirls.client.graphs.listGraphs({
  projectId: "...",
  pagination: {
    before: undefined,  // Cursor for previous page
    after: "cursor123", // Cursor for next page
    first: 25,          // Items per page (1-100)
  },
});
```

### Config (`@swirls/sdk/config`)

```typescript
import { defineConfig } from "@swirls/sdk/config";

// Creates swirls.config.ts
export default defineConfig({
  projectId: "uuid",          // Your Swirls project UUID
  genPath: "src/swirls.gen.ts", // Output path for generated code
});
```

### Form Adapter (`@swirls/sdk/form`)

```typescript
import { useSwirlsFormAdapter } from "@swirls/sdk/form";

// Returns a FormAdapter object
const adapter = useSwirlsFormAdapter("form-name", defaultValues);

// adapter.schema     - Zod schema for validation
// adapter.defaultValues - Default form values
// adapter.submit(data) - Submit form data to Swirls
//   Returns: Promise<{ message: string, executionIds: string[] }>
```

### TanStack Query Utils (`swirls.query`)

The `Swirls` instance also exposes `swirls.query` with TanStack Query utilities for every method, useful for data fetching in React components via `useQuery`/`useMutation`.

### Code Generation (`@swirls/sdk/form/generate`)

Called internally by the CLI. Converts JSON Schema to Zod schemas and generates:
- Typed form definitions
- `registerForms()` bootstrap function
- Module augmentation for `FormRegistry` interface

---

## Swirls CLI Reference

```bash
# Authentication
swirls auth login     # OAuth login (opens browser)
swirls auth logout    # Revoke session

# Development
swirls dev init       # Create swirls.config.ts
swirls dev gen        # Generate TypeScript types from project forms

# Projects
swirls project create  # Create a new Swirls project
swirls project open    # Open project in browser

# File Storage
swirls storage list [path]             # List files
swirls storage upload <src> <dest>     # Upload file
swirls storage download <src> <dest>   # Download file
swirls storage delete <path>           # Delete file
swirls storage url <path> [--expires]  # Get signed URL
```

---

## Patterns and Best Practices

### 1. One Swirls Project Per Micro-SaaS

Each micro-SaaS app should have its own Swirls project. This isolates forms, graphs, secrets, and storage.

### 2. Use TanStack Query for Route Data

Use `queryOptions`, `context.queryClient.ensureQueryData` in route loaders, and `useSuspenseQuery` in page components so that:

- Route transitions wait on data (loader promise), which keeps the router in a pending state and allows components like a navigation progress bar to run.
- Data is cached in the QueryClient; refetch after mutations with `queryClient.invalidateQueries({ queryKey: [...] })`.

Define shared query options, prefetch in the loader, and read in the component:

```typescript
const itemsQueryOptions = queryOptions({
  queryKey: ["items"],
  queryFn: () => getItems(),
});

export const Route = createFileRoute("/dashboard")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(itemsQueryOptions),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: items } = useSuspenseQuery(itemsQueryOptions);
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["items"] });
  // ...
}
```

Ensure the root route uses `createRootRouteWithContext<RouterContext>()` and the router provides `context: { queryClient }` (see Step 6).

### 3. Use Forms for User Input -> AI Processing

The primary integration point is: **User submits form in your app -> Swirls validates & triggers workflow graph -> Graph processes with LLMs/HTTP/code -> Results stored in stream**.

```
User -> Your App (TanStack Start) -> Swirls Form -> Trigger -> Graph -> Stream
                                                                          |
User <- Your App (query stream) <-----------------------------------------
```

### 4. Use Streams for Reading Results

After a graph execution completes, query the connected data stream to read results back into your app using the SDK client:

```typescript
import { swirls } from "@/lib/swirls";

const results = await swirls.client.streams.executeStreamQuery({
  projectId: "your-project-id",
  streamId: "your-stream-id",
  filters: [
    { column: "user_id", operator: "eq", value: userId },
    { column: "created_at", operator: "gte", value: startDate },
  ],
});
```

### 5. Use Webhooks for External Integrations

If your SaaS receives data from external services (Stripe, GitHub, etc.), create a Swirls webhook and point the external service to it. The webhook triggers a graph that processes the data.

### 6. Use Schedules for Recurring Tasks

Cron-based schedules trigger graphs on a recurring basis. Use for daily reports, data sync, cleanup jobs, etc.

### 7. Auth Guard Everything

Always use `authedFn()` from `@/lib/auth-guard` instead of bare `createServerFn()` for any server function that accesses user data. This enforces auth via middleware — you cannot forget it because `context.userId` is the only way to get the user ID. Only use bare `createServerFn()` for truly public endpoints. Check ownership (`userId` match) before update/delete operations.

### 8. Keep Domain Logic in the App, AI Logic in Swirls

- **In your app (TanStack Start)**: User management, CRUD operations, UI rendering, session management
- **In Swirls (graphs)**: LLM calls, HTTP enrichment, data transforms, email notifications, AI decision-making

### 9. Generate Types After Every Swirls Change

Whenever you modify forms in the Swirls dashboard, regenerate types:

```bash
bun run swirls:gen
```

This keeps your TypeScript types in sync with your Swirls project.

### 10. Environment Variable Security

- `BETTER_AUTH_SECRET` - Generate with `openssl rand -base64 32`
- `SWIRLS_API_KEY` - Create in Swirls dashboard (format: `ak_*`)
- Never commit `.env` files

### 11. Local Development Workflow

```bash
# 1. Start the app
bun run dev

# 2. Push schema to local SQLite
bun run db:push

# 3. Open Drizzle Studio to inspect data
bun run db:studio

# 4. After creating forms in Swirls dashboard, generate types
bun run swirls:gen
```

---

**Last verified**: 2026-02-15 | **Skill version**: 1.1.0 | **SDK docs**: https://swirls.ai/docs/docs/references/sdk
