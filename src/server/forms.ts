import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { formMappings } from "@/db/schema";
import { authMiddleware } from "@/lib/auth-guard";
import {
	type FormFieldDisplay,
	type FormFieldInput,
	formFieldsToJsonSchema,
	jsonSchemaToFormFields,
} from "@/lib/swirls-schema";

export type { FormFieldDisplay };

import { env } from "@/env";
import { swirls } from "@/lib/swirls";

// ─── Types (UI-compatible) ───────────────────────────────────────────

export type FormDisplay = {
	id: number;
	swirlsFormId: string;
	userId: string;
	name: string;
	description: string | null;
	slug: string;
	published: boolean;
	createdAt: Date;
	updatedAt?: Date;
	fields: FormFieldDisplay[];
	submissionCount?: number;
};

export type FormSubmissionDisplay = {
	id: string;
	submittedAt: Date;
	values: Array<{ field: FormFieldDisplay; value: string }>;
};

// ─── Slug Helpers ────────────────────────────────────────────────────

function generateSlug(name: string): string {
	const base = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
	const suffix = Math.random().toString(36).slice(2, 8);

	return `${base}-${suffix}`;
}

// ─── Form CRUD ───────────────────────────────────────────────────────

export const getForms = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const mappings = await db.query.formMappings.findMany({
			where: eq(formMappings.userId, context.userId),
			orderBy: [desc(formMappings.createdAt)],
		});

		if (mappings.length === 0) return [];

		const result: FormDisplay[] = [];

		for (const m of mappings) {
			try {
				const swirlsForm = await swirls.client.forms.getForm({
					id: m.swirlsFormId,
				});
				const { results: submissions } =
					await swirls.client.forms.listFormSubmissions({
						formId: m.swirlsFormId,
					});
				const fields = jsonSchemaToFormFields(swirlsForm.schema ?? {});

				result.push({
					id: m.id,
					swirlsFormId: m.swirlsFormId,
					userId: m.userId,
					name: swirlsForm.name,
					description: swirlsForm.description ?? null,
					slug: m.slug,
					published: swirlsForm.enabled ?? false,
					createdAt: new Date(m.createdAt),
					fields,
					submissionCount: Array.isArray(submissions) ? submissions.length : 0,
				});
			} catch {
				// Form may have been deleted in Swirls
				continue;
			}
		}

		return result;
	});

export const getForm = createServerFn({ method: "GET" })
	.inputValidator(z.object({ formId: z.number() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const [mapping] = await db
			.select()
			.from(formMappings)
			.where(
				and(
					eq(formMappings.id, data.formId),
					eq(formMappings.userId, context.userId),
				),
			)
			.limit(1);

		if (!mapping) return null;

		try {
			const swirlsForm = await swirls.client.forms.getForm({
				id: mapping.swirlsFormId,
			});
			const fields = jsonSchemaToFormFields(swirlsForm.schema ?? {});

			return {
				id: mapping.id,
				swirlsFormId: mapping.swirlsFormId,
				userId: mapping.userId,
				name: swirlsForm.name,
				description: swirlsForm.description ?? null,
				slug: mapping.slug,
				published: swirlsForm.enabled ?? false,
				createdAt: new Date(mapping.createdAt),
				fields,
			} satisfies FormDisplay;
		} catch {
			return null;
		}
	});

export const createForm = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({ name: z.string().min(1), description: z.string().optional() }),
	)
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const slug = generateSlug(data.name);
		const name = slug.replace(/-/g, "_");
		const projectId = env.SWIRLS_PROJECT_ID;

		const { id: swirlsFormId } = await swirls.client.forms.createForm({
			projectId,
			name,
			label: data.name,
			description: data.description,
			schema: { type: "object", properties: {} },
			enabled: false,
		});

		const [mapping] = await db
			.insert(formMappings)
			.values({
				userId: context.userId,
				swirlsFormId,
				slug,
			})
			.returning();

		if (!mapping) {
			throw new Error("Failed to create form mapping");
		}

		return mapping;
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
		const [mapping] = await db
			.select()
			.from(formMappings)
			.where(
				and(
					eq(formMappings.id, data.formId),
					eq(formMappings.userId, context.userId),
				),
			)
			.limit(1);

		if (!mapping) return null;

		const swirlsForm = await swirls.client.forms.getForm({
			id: mapping.swirlsFormId,
		});

		await swirls.client.forms.updateForm({
			id: mapping.swirlsFormId,
			name: data.name ?? swirlsForm.name,
			description:
				data.description !== undefined
					? data.description
					: swirlsForm.description,
		});

		return {
			id: mapping.id,
			swirlsFormId: mapping.swirlsFormId,
			userId: mapping.userId,
			name: data.name ?? swirlsForm.name,
			description: data.description ?? swirlsForm.description ?? null,
			slug: mapping.slug,
			published: swirlsForm.enabled ?? false,
			createdAt: new Date(mapping.createdAt),
			fields: jsonSchemaToFormFields(swirlsForm.schema ?? {}),
		} satisfies FormDisplay;
	});

export const deleteForm = createServerFn({ method: "POST" })
	.inputValidator(z.object({ formId: z.number() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const [mapping] = await db
			.select()
			.from(formMappings)
			.where(
				and(
					eq(formMappings.id, data.formId),
					eq(formMappings.userId, context.userId),
				),
			)
			.limit(1);

		if (!mapping) return { success: false };

		await swirls.client.forms.deleteForm({ id: mapping.swirlsFormId });
		await db.delete(formMappings).where(eq(formMappings.id, data.formId));

		return { success: true };
	});

// ─── Publish / Share ─────────────────────────────────────────────────

export const togglePublish = createServerFn({ method: "POST" })
	.inputValidator(z.object({ formId: z.number() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const [mapping] = await db
			.select()
			.from(formMappings)
			.where(
				and(
					eq(formMappings.id, data.formId),
					eq(formMappings.userId, context.userId),
				),
			)
			.limit(1);

		if (!mapping) return null;

		const swirlsForm = await swirls.client.forms.getForm({
			id: mapping.swirlsFormId,
		});

		await swirls.client.forms.updateForm({
			id: mapping.swirlsFormId,
			enabled: !swirlsForm.enabled,
		});

		return {
			id: mapping.id,
			swirlsFormId: mapping.swirlsFormId,
			userId: mapping.userId,
			name: swirlsForm.name,
			description: swirlsForm.description ?? null,
			slug: mapping.slug,
			published: !swirlsForm.enabled,
			createdAt: new Date(mapping.createdAt),
			fields: jsonSchemaToFormFields(swirlsForm.schema ?? {}),
		} satisfies FormDisplay;
	});

// ─── Field CRUD ──────────────────────────────────────────────────────

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
		const [mapping] = await db
			.select()
			.from(formMappings)
			.where(
				and(
					eq(formMappings.id, data.formId),
					eq(formMappings.userId, context.userId),
				),
			)
			.limit(1);

		if (!mapping) return null;

		const swirlsForm = await swirls.client.forms.getForm({
			id: mapping.swirlsFormId,
		});
		const existingFields = jsonSchemaToFormFields(swirlsForm.schema ?? {});
		const newField: FormFieldInput = {
			label: data.label,
			type: data.type,
			required: data.required,
			order: data.order,
		};
		const allFields: FormFieldInput[] = [
			...existingFields.map((f) => ({
				label: f.label,
				type: f.type,
				required: f.required,
				order: f.order,
				placeholder: f.placeholder,
				options: f.options ? JSON.stringify(f.options) : null,
			})),
			newField,
		];
		const schema = formFieldsToJsonSchema(allFields);

		await swirls.client.forms.updateForm({
			id: mapping.swirlsFormId,
			schema,
		});

		const fields = jsonSchemaToFormFields(schema);
		const added = fields[fields.length - 1];
		return added;
	});

export const updateFormField = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			formId: z.number(),
			fieldKey: z.string(),
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
		const [mapping] = await db
			.select()
			.from(formMappings)
			.where(
				and(
					eq(formMappings.id, data.formId),
					eq(formMappings.userId, context.userId),
				),
			)
			.limit(1);

		if (!mapping) return null;

		const swirlsForm = await swirls.client.forms.getForm({
			id: mapping.swirlsFormId,
		});
		let fields = jsonSchemaToFormFields(swirlsForm.schema ?? {});
		const idx = fields.findIndex((f) => f.key === data.fieldKey);
		if (idx < 0) return null;

		fields = fields.map((f, i) => ({
			...f,
			label: f.key === data.fieldKey ? (data.label ?? f.label) : f.label,
			type: f.key === data.fieldKey ? (data.type ?? f.type) : f.type,
			required:
				f.key === data.fieldKey ? (data.required ?? f.required) : f.required,
			order:
				data.order !== undefined && f.key === data.fieldKey ? data.order : i,
		}));

		const schema = formFieldsToJsonSchema(
			fields.map((f) => ({
				label: f.label,
				type: f.type,
				required: f.required,
				order: f.order,
				placeholder: f.placeholder,
				options: f.options ? JSON.stringify(f.options) : null,
			})),
		);

		await swirls.client.forms.updateForm({
			id: mapping.swirlsFormId,
			schema,
		});

		return fields[idx];
	});

export const deleteFormField = createServerFn({ method: "POST" })
	.inputValidator(z.object({ formId: z.number(), fieldKey: z.string() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const [mapping] = await db
			.select()
			.from(formMappings)
			.where(
				and(
					eq(formMappings.id, data.formId),
					eq(formMappings.userId, context.userId),
				),
			)
			.limit(1);

		if (!mapping) return { success: false };

		const swirlsForm = await swirls.client.forms.getForm({
			id: mapping.swirlsFormId,
		});
		const fields = jsonSchemaToFormFields(swirlsForm.schema ?? {}).filter(
			(f) => f.key !== data.fieldKey,
		);

		const schema = formFieldsToJsonSchema(
			fields.map((f) => ({
				label: f.label,
				type: f.type,
				required: f.required,
				order: f.order,
				placeholder: f.placeholder,
				options: f.options ? JSON.stringify(f.options) : null,
			})),
		);

		await swirls.client.forms.updateForm({
			id: mapping.swirlsFormId,
			schema,
		});

		return { success: true };
	});

// ─── Public Form (no auth) ───────────────────────────────────────────

export const getPublicForm = createServerFn({ method: "GET" })
	.inputValidator(z.object({ slug: z.string() }))
	.handler(async ({ data }) => {
		const [mapping] = await db
			.select()
			.from(formMappings)
			.where(eq(formMappings.slug, data.slug))
			.limit(1);

		if (!mapping) return null;

		try {
			const swirlsForm = await swirls.client.forms.getForm({
				id: mapping.swirlsFormId,
			});
			if (!swirlsForm.enabled) return null;

			const fields = jsonSchemaToFormFields(swirlsForm.schema ?? {});

			return {
				id: mapping.id,
				swirlsFormId: mapping.swirlsFormId,
				userId: mapping.userId,
				name: swirlsForm.name,
				description: swirlsForm.description ?? null,
				slug: mapping.slug,
				published: true,
				createdAt: new Date(mapping.createdAt),
				fields,
			} satisfies FormDisplay;
		} catch {
			return null;
		}
	});

export const submitForm = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			slug: z.string(),
			values: z.record(z.string(), z.string()),
		}),
	)
	.handler(async ({ data }) => {
		const [mapping] = await db
			.select()
			.from(formMappings)
			.where(eq(formMappings.slug, data.slug))
			.limit(1);

		if (!mapping) return { success: false, error: "Form not found" };

		try {
			const swirlsForm = await swirls.client.forms.getForm({
				id: mapping.swirlsFormId,
			});
			if (!swirlsForm.enabled) {
				return { success: false, error: "Form is not accepting submissions" };
			}

			const fields = jsonSchemaToFormFields(swirlsForm.schema ?? {});

			// Validate required
			for (const field of fields) {
				if (field.required) {
					const val = data.values[field.key];
					if (val === undefined || val === null || String(val).trim() === "") {
						return {
							success: false,
							error: `"${field.label}" is required`,
						};
					}
				}
			}

			// Map values: checkbox uses "true"/"false", convert to boolean for Swirls
			const submitData: Record<string, string | number | boolean> = {};
			for (const field of fields) {
				const raw = data.values[field.key];
				if (raw === undefined || raw === null) continue;
				if (field.type === "checkbox") {
					submitData[field.key] = raw === "true" || raw === "1";
				} else if (field.type === "number") {
					submitData[field.key] = Number.parseFloat(raw) || 0;
				} else {
					submitData[field.key] = raw;
				}
			}

			await swirls.client.forms.submitForm({
				formId: mapping.swirlsFormId,
				data: submitData,
			});

			return { success: true };
		} catch (err) {
			return {
				success: false,
				error: err instanceof Error ? err.message : "Submission failed",
			};
		}
	});

// ─── Submissions (authed) ────────────────────────────────────────────

export const getFormSubmissions = createServerFn({ method: "GET" })
	.inputValidator(z.object({ formId: z.number() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		const [mapping] = await db
			.select()
			.from(formMappings)
			.where(
				and(
					eq(formMappings.id, data.formId),
					eq(formMappings.userId, context.userId),
				),
			)
			.limit(1);

		if (!mapping) return [];

		try {
			const swirlsForm = await swirls.client.forms.getForm({
				id: mapping.swirlsFormId,
			});
			const fields = jsonSchemaToFormFields(swirlsForm.schema ?? {});
			const fieldMap = new Map(fields.map((f) => [f.key, f]));

			const { results } = await swirls.client.forms.listFormSubmissions({
				formId: mapping.swirlsFormId,
			});

			if (!Array.isArray(results)) return [];

			return results.map((sub: Record<string, unknown>) => {
				const values: Array<{ field: FormFieldDisplay; value: string }> = [];
				for (const [key, val] of Object.entries(sub)) {
					if (key === "id" || key === "submittedAt" || key === "createdAt")
						continue;
					const field = fieldMap.get(key);
					if (field) {
						values.push({
							field,
							value: val === null || val === undefined ? "" : String(val),
						});
					}
				}
				return {
					id: String(sub.id ?? crypto.randomUUID()),
					submittedAt: sub.submittedAt
						? new Date(sub.submittedAt as string | number)
						: new Date(),
					values,
				} satisfies FormSubmissionDisplay;
			});
		} catch {
			return [];
		}
	});

export const deleteSubmission = createServerFn({ method: "POST" })
	.inputValidator(z.object({ submissionId: z.string() }))
	.middleware([authMiddleware])
	.handler(async ({ context, data }) => {
		// Swirls SDK may not expose delete form submission - document limitation
		// For now, return success without doing anything
		void context;
		void data;
		return { success: false, message: "Delete submission not supported" };
	});
