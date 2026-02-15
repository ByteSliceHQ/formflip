import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import {
	formFields,
	formSubmissions,
	formSubmissionValues,
	forms,
} from "@/db/schema";
import { authMiddleware } from "@/lib/auth-guard";

// ─── Slug Helpers ──────────────────────────────────────────────────

function generateSlug(name: string): string {
	const base = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
	const suffix = Math.random().toString(36).slice(2, 8);
	return `${base}-${suffix}`;
}

// ─── Form CRUD ─────────────────────────────────────────────────────

export const getForms = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const userForms = await db.query.forms.findMany({
			where: eq(forms.userId, context.userId),
			with: { fields: { orderBy: [asc(formFields.order)] } },
			orderBy: [desc(forms.createdAt)],
		});

		if (userForms.length === 0) return [];

		// Attach submission counts
		const formIds = userForms.map((f) => f.id);
		const counts = await db
			.select({
				formId: formSubmissions.formId,
				count: sql<number>`count(*)`.as("count"),
			})
			.from(formSubmissions)
			.where(
				sql`${formSubmissions.formId} IN (${sql.join(
					formIds.map((id) => sql`${id}`),
					sql`, `,
				)})`,
			)
			.groupBy(formSubmissions.formId);

		const countMap = new Map(counts.map((c) => [c.formId, c.count]));

		return userForms.map((f) => ({
			...f,
			submissionCount: countMap.get(f.id) ?? 0,
		}));
	});

export const getForm = createServerFn({ method: "GET" })
	.inputValidator(z.object({ formId: z.number() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const form = await db.query.forms.findFirst({
			where: and(eq(forms.id, data.formId), eq(forms.userId, context.userId)),
			with: { fields: { orderBy: [asc(formFields.order)] } },
		});
		return form ?? null;
	});

export const createForm = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({ name: z.string().min(1), description: z.string().optional() }),
	)
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const slug = generateSlug(data.name);
		const [newForm] = await db
			.insert(forms)
			.values({
				userId: context.userId,
				name: data.name,
				description: data.description,
				slug,
			})
			.returning();
		return newForm;
	});

export const updateForm = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			formId: z.number(),
			name: z.string().optional(),
			description: z.string().optional(),
		}),
	)
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const existing = await db.query.forms.findFirst({
			where: and(eq(forms.id, data.formId), eq(forms.userId, context.userId)),
		});
		if (!existing) return null;
		const [updated] = await db
			.update(forms)
			.set({
				...(data.name !== undefined && { name: data.name }),
				...(data.description !== undefined && {
					description: data.description,
				}),
			})
			.where(eq(forms.id, data.formId))
			.returning();
		return updated;
	});

export const deleteForm = createServerFn({ method: "POST" })
	.inputValidator(z.object({ formId: z.number() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const existing = await db.query.forms.findFirst({
			where: and(eq(forms.id, data.formId), eq(forms.userId, context.userId)),
		});
		if (!existing) return null;
		await db.delete(forms).where(eq(forms.id, data.formId));
		return { success: true };
	});

// ─── Publish / Share ───────────────────────────────────────────────

export const togglePublish = createServerFn({ method: "POST" })
	.inputValidator(z.object({ formId: z.number() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const existing = await db.query.forms.findFirst({
			where: and(eq(forms.id, data.formId), eq(forms.userId, context.userId)),
		});
		if (!existing) return null;
		const [updated] = await db
			.update(forms)
			.set({ published: !existing.published })
			.where(eq(forms.id, data.formId))
			.returning();
		return updated;
	});

// ─── Field CRUD ────────────────────────────────────────────────────

export const createFormField = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			formId: z.number(),
			label: z.string().min(1),
			type: z.enum([
				"text",
				"email",
				"number",
				"textarea",
				"checkbox",
				"select",
			]),
			required: z.boolean(),
			order: z.number(),
		}),
	)
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		// Verify ownership
		const form = await db.query.forms.findFirst({
			where: and(eq(forms.id, data.formId), eq(forms.userId, context.userId)),
		});
		if (!form) return null;
		const [field] = await db
			.insert(formFields)
			.values({
				formId: data.formId,
				label: data.label,
				type: data.type,
				required: data.required,
				order: data.order,
			})
			.returning();
		return field;
	});

export const updateFormField = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			fieldId: z.number(),
			label: z.string().optional(),
			type: z
				.enum(["text", "email", "number", "textarea", "checkbox", "select"])
				.optional(),
			required: z.boolean().optional(),
			order: z.number().optional(),
		}),
	)
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		// Verify ownership via join
		const field = await db.query.formFields.findFirst({
			where: eq(formFields.id, data.fieldId),
			with: { form: true },
		});
		if (!field || field.form.userId !== context.userId) return null;
		const [updated] = await db
			.update(formFields)
			.set({
				...(data.label !== undefined && { label: data.label }),
				...(data.type !== undefined && { type: data.type }),
				...(data.required !== undefined && { required: data.required }),
				...(data.order !== undefined && { order: data.order }),
			})
			.where(eq(formFields.id, data.fieldId))
			.returning();
		return updated;
	});

export const deleteFormField = createServerFn({ method: "POST" })
	.inputValidator(z.object({ fieldId: z.number() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const field = await db.query.formFields.findFirst({
			where: eq(formFields.id, data.fieldId),
			with: { form: true },
		});
		if (!field || field.form.userId !== context.userId) return null;
		await db.delete(formFields).where(eq(formFields.id, data.fieldId));
		return { success: true };
	});

// ─── Public Form (no auth) ────────────────────────────────────────

export const getPublicForm = createServerFn({ method: "GET" })
	.inputValidator(z.object({ slug: z.string() }))
	.middleware([authMiddleware])
	.handler(async ({ data }) => {
		const form = await db.query.forms.findFirst({
			where: and(eq(forms.slug, data.slug), eq(forms.published, true)),
			with: { fields: { orderBy: [asc(formFields.order)] } },
		});
		return form ?? null;
	});

export const submitForm = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			slug: z.string(),
			values: z.record(z.string(), z.string()),
		}),
	)
	.middleware([authMiddleware])
	.handler(async ({ data }) => {
		const form = await db.query.forms.findFirst({
			where: and(eq(forms.slug, data.slug), eq(forms.published, true)),
			with: { fields: true },
		});
		if (!form) return { success: false, error: "Form not found" };

		// Validate required fields
		for (const field of form.fields) {
			if (field.required) {
				const val = data.values[String(field.id)];
				if (!val || val.trim() === "") {
					return {
						success: false,
						error: `"${field.label}" is required`,
					};
				}
			}
		}

		// Insert submission
		const [submission] = await db
			.insert(formSubmissions)
			.values({ formId: form.id })
			.returning();

		// Insert values
		const valueRows = form.fields
			.map((field) => ({
				submissionId: submission.id,
				fieldId: field.id,
				value: data.values[String(field.id)] ?? "",
			}))
			.filter((v) => v.value !== "");

		if (valueRows.length > 0) {
			await db.insert(formSubmissionValues).values(valueRows);
		}

		return { success: true };
	});

// ─── Submissions (authed) ──────────────────────────────────────────

export const getFormSubmissions = createServerFn({ method: "GET" })
	.inputValidator(z.object({ formId: z.number() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		// Verify ownership
		const form = await db.query.forms.findFirst({
			where: and(eq(forms.id, data.formId), eq(forms.userId, context.userId)),
		});
		if (!form) return [];

		return db.query.formSubmissions.findMany({
			where: eq(formSubmissions.formId, data.formId),
			with: {
				values: {
					with: { field: true },
				},
			},
			orderBy: [desc(formSubmissions.submittedAt)],
		});
	});

export const deleteSubmission = createServerFn({ method: "POST" })
	.inputValidator(z.object({ submissionId: z.number() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const submission = await db.query.formSubmissions.findFirst({
			where: eq(formSubmissions.id, data.submissionId),
			with: { form: true },
		});
		if (!submission || submission.form.userId !== context.userId) return null;
		await db
			.delete(formSubmissions)
			.where(eq(formSubmissions.id, data.submissionId));
		return { success: true };
	});
