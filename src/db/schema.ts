import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ─── Better Auth Tables ────────────────────────────────────────────

export const user = sqliteTable("users", {
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

export const session = sqliteTable("sessions", {
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

export const account = sqliteTable("accounts", {
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

export const verification = sqliteTable("verifications", {
	id: text().primaryKey(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});

// ─── App Tables ────────────────────────────────────────────────────

export const formMappings = sqliteTable("form_mappings", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	swirlsFormId: text("swirls_form_id").notNull().unique(),
	swirlsGraphId: text("swirls_graph_id"),
	workflowGraphSnapshot: text("workflow_graph_snapshot"),
	slug: text().notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(strftime('%s', 'now') * 1000)`),
});

// ─── Relations ─────────────────────────────────────────────────────

export const formMappingsRelations = relations(formMappings, ({ one }) => ({
	user: one(user, {
		fields: [formMappings.userId],
		references: [user.id],
	}),
}));

// ─── Types ─────────────────────────────────────────────────────────

export type FormMapping = typeof formMappings.$inferSelect;
export type NewFormMapping = typeof formMappings.$inferInsert;
