# FormFlip

> [!WARNING]
> This project is a work in progress and is not ready for production use.

AI-driven form building and submission platform, powered by [Swirls](https://swirls.ai) under the hood for intelligent form management and AI components. Built by the team at [ByteSlice.co](https://byteslice.co).

## Use FormFlip as a Service

FormFlip is available as a fully managed SaaS at **[formflip.ai](https://formflip.ai)** with very generous pricing! No infrastructure to manage, just sign up and start building intelligent forms.

## Features

- **AI-Powered Forms** — Intelligent form submissions that understand context and adapt to user behavior, powered by Swirls
- **Instant Processing** — Submissions are validated, enriched, and routed by AI the moment they arrive
- **Configurable Fields** — Build forms with custom input types, required fields, and flexible ordering
- **Dashboard Management** — Create, edit, and manage all your forms from a single intuitive dashboard
- **Smart Validation** — AI-driven validation that goes beyond type checking to understand intent
- **Self-Hostable** — Run FormFlip on your own infrastructure with full control over your data

## Self-Hosting

### Prerequisites

- [Bun](https://bun.sh) v1+
- SQLite (local file) or a [Turso](https://turso.tech) database

### Quick Start

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/byteslicehq/formflip.git
cd formflip
bun install
```

2. Create a `.env` file from the example:

```bash
cp .env.example .env
```

3. Configure your environment variables:

```env
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

4. Push the database schema:

```bash
bun run db:push
```

5. Start the development server:

```bash
bun run dev
```

### Production Build

```bash
bun run build
bun run start
```

### External Database (Turso/Bunny.net/libSQL)

By default FormFlip uses a local SQLite file. To use an external database, set these environment variables:

```env
DB_URL=libsql://your-db.turso.io
DB_TOKEN=your-auth-token
```

### Docker

Build and run with Docker:

```bash
docker build -t formflip .
docker run -p 3000:3000 \
  -e BETTER_AUTH_SECRET=your-secret \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  -e DB_URL=libsql://your-db.turso.io \
  -e DB_TOKEN=your-auth-token \
  formflip
```

Or pull the pre-built image from GHCR:

```bash
docker pull ghcr.io/byteslicehq/formflip:main
```

### Development Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run test` | Run tests |
| `bun run lint` | Lint with Biome |
| `bun run format` | Format with Biome |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run migrations |
| `bun run db:push` | Push schema to database |
| `bun run db:studio` | Open Drizzle Studio |

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — Full-stack React framework
- [Swirls](https://swirls.ai) — AI and form management engine
- [Better Auth](https://www.better-auth.com) — Self-hosted authentication
- [Drizzle ORM](https://orm.drizzle.team) — TypeScript ORM
- [Tailwind CSS](https://tailwindcss.com) — Utility-first styling
- [Bun](https://bun.sh) — Runtime and package manager

## License

Built by [ByteSlice.co](https://byteslice.co) and licensed under the [MIT License](LICENSE).
