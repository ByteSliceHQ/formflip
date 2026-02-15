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

export const forms = sqliteTable("forms", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	description: text(),
	slug: text().notNull().unique(),
	published: integer({ mode: "boolean" }).notNull().default(false),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(strftime('%s', 'now') * 1000)`),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(strftime('%s', 'now') * 1000)`)
		.$onUpdate(() => new Date()),
});

export const formFields = sqliteTable("form_fields", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	formId: integer("form_id", { mode: "number" })
		.notNull()
		.references(() => forms.id, { onDelete: "cascade" }),
	label: text().notNull(),
	type: text({
		enum: ["text", "email", "number", "textarea", "checkbox", "select"],
	})
		.notNull()
		.default("text"),
	placeholder: text(),
	options: text(), // JSON array for select fields
	required: integer({ mode: "boolean" }).notNull().default(false),
	order: integer({ mode: "number" }).notNull().default(0),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(strftime('%s', 'now') * 1000)`),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(strftime('%s', 'now') * 1000)`)
		.$onUpdate(() => new Date()),
});

export const formSubmissions = sqliteTable("form_submissions", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	formId: integer("form_id", { mode: "number" })
		.notNull()
		.references(() => forms.id, { onDelete: "cascade" }),
	submittedAt: integer("submitted_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(strftime('%s', 'now') * 1000)`),
});

export const formSubmissionValues = sqliteTable("form_submission_values", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	submissionId: integer("submission_id", { mode: "number" })
		.notNull()
		.references(() => formSubmissions.id, { onDelete: "cascade" }),
	fieldId: integer("field_id", { mode: "number" })
		.notNull()
		.references(() => formFields.id, { onDelete: "cascade" }),
	value: text().notNull().default(""),
});

// ─── Relations ─────────────────────────────────────────────────────

export const formsRelations = relations(forms, ({ many }) => ({
	fields: many(formFields),
	submissions: many(formSubmissions),
}));

export const formFieldsRelations = relations(formFields, ({ one }) => ({
	form: one(forms, {
		fields: [formFields.formId],
		references: [forms.id],
	}),
}));

export const formSubmissionsRelations = relations(
	formSubmissions,
	({ one, many }) => ({
		form: one(forms, {
			fields: [formSubmissions.formId],
			references: [forms.id],
		}),
		values: many(formSubmissionValues),
	}),
);

export const formSubmissionValuesRelations = relations(
	formSubmissionValues,
	({ one }) => ({
		submission: one(formSubmissions, {
			fields: [formSubmissionValues.submissionId],
			references: [formSubmissions.id],
		}),
		field: one(formFields, {
			fields: [formSubmissionValues.fieldId],
			references: [formFields.id],
		}),
	}),
);

// ─── Types ─────────────────────────────────────────────────────────

export type Form = typeof forms.$inferSelect;
export type NewForm = typeof forms.$inferInsert;
export type FormField = typeof formFields.$inferSelect;
export type NewFormField = typeof formFields.$inferInsert;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type FormSubmissionValue = typeof formSubmissionValues.$inferSelect;
