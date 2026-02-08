import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { formFields, forms } from "@/db/schema";
import { auth } from "@/lib/auth";

const requireAuth = async () => {
	const request = getRequest();
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		throw redirect({ to: "/" });
	}
	return session.user.id;
};

export const getForms = createServerFn({ method: "GET" }).handler(async () => {
	const userId = await requireAuth();
	return db.query.forms.findMany({
		where: eq(forms.userId, userId),
		with: { fields: { orderBy: [asc(formFields.order)] } },
		orderBy: [asc(forms.createdAt)],
	});
});

export const getForm = createServerFn({ method: "GET" })
	.inputValidator(z.object({ formId: z.number() }))
	.handler(async ({ data }) => {
		const userId = await requireAuth();
		const form = await db.query.forms.findFirst({
			where: eq(forms.id, data.formId),
			with: { fields: { orderBy: [asc(formFields.order)] } },
		});
		if (!form || form.userId !== userId) return null;
		return form;
	});

export const createForm = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({ name: z.string(), description: z.string().optional() }),
	)
	.handler(async ({ data }) => {
		const userId = await requireAuth();
		const [newForm] = await db
			.insert(forms)
			.values({
				userId,
				name: data.name,
				description: data.description,
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
	.handler(async ({ data }) => {
		const userId = await requireAuth();
		const existing = await db.query.forms.findFirst({
			where: eq(forms.id, data.formId),
		});
		if (!existing || existing.userId !== userId) return null;
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
	.handler(async ({ data }) => {
		const userId = await requireAuth();
		const existing = await db.query.forms.findFirst({
			where: eq(forms.id, data.formId),
		});
		if (!existing || existing.userId !== userId) return null;
		await db.delete(forms).where(eq(forms.id, data.formId));
		return { success: true };
	});

export const createFormField = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			formId: z.number(),
			label: z.string(),
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
	.handler(async ({ data }) => {
		await requireAuth();
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
	.handler(async ({ data }) => {
		await requireAuth();
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
	.handler(async ({ data }) => {
		await requireAuth();
		await db.delete(formFields).where(eq(formFields.id, data.fieldId));
		return { success: true };
	});
