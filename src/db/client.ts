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
	const { default: Database } = await import("better-sqlite3");
	const { drizzle } = await import("drizzle-orm/better-sqlite3");
	const sqlite = new Database("sqlite.db");
	sqlite.pragma("journal_mode = WAL");
	sqlite.pragma("foreign_keys = ON");
	return drizzle({ client: sqlite, schema });
};

export const db = await createDb();
