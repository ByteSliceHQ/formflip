import * as schema from "./schema";

const createDb = async () => {
	if (process.env.DB_URL && process.env.DB_TOKEN) {
		const { createClient } = await import("@libsql/client/web");
		const { drizzle } = await import("drizzle-orm/libsql");
		const client = createClient({
			url: process.env.DB_URL,
			authToken: process.env.DB_TOKEN,
		});
		return drizzle({ client, schema });
	}
	const { Database } = await import("bun:sqlite");
	const { drizzle } = await import("drizzle-orm/bun-sqlite");
	const sqlite = new Database("sqlite.db");
	sqlite.run("PRAGMA journal_mode = WAL;");
	sqlite.run("PRAGMA foreign_keys = ON;");
	return drizzle({ client: sqlite, schema });
};

export const db = await createDb();
