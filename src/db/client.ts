import { Database } from "bun:sqlite";
import { createServerOnlyFn } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { env } from "@/env";
import * as schema from "./schema";

function getConnectionString(): string {
	const base = env.DB_URL ?? "sqlite.db";

	if (!env.DB_TOKEN) {
		return base;
	}

	const sep = base.includes("?") ? "&" : "?";
	return `${base}${sep}auth_token=${encodeURIComponent(env.DB_TOKEN)}`;
}

const createDb = createServerOnlyFn(() => {
	const sqlite = new Database(getConnectionString());

	// TODO: do we need these?
	sqlite.run("PRAGMA journal_mode = WAL;");
	sqlite.run("PRAGMA foreign_keys = ON;");

	return drizzle({ client: sqlite, schema });
});

export const db = createDb();
