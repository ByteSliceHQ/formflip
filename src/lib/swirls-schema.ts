/**
 * Converts FormFlip field definitions to Swirls JSON Schema format.
 * Swirls expects: { type: "object", properties: { ... }, required: [...] }
 */

export type FormFieldType =
	| "text"
	| "email"
	| "number"
	| "textarea"
	| "checkbox"
	| "select";

export interface FormFieldInput {
	label: string;
	type: FormFieldType;
	required: boolean;
	order: number;
	placeholder?: string | null;
	options?: string | null; // JSON array for select
}

export interface FormFieldDisplay {
	key: string;
	label: string;
	type: FormFieldType;
	required: boolean;
	order: number;
	placeholder?: string | null;
	options?: string[] | null;
}

export type JsonSchemaProperty = {
	type: string;
	format?: string;
	enum?: string[];
	title?: string;
	description?: string;
	"x-formflip-ui"?: string; // "textarea" to distinguish from text
};

export type JsonSchema = {
	type: "object";
	properties: Record<string, JsonSchemaProperty>;
	required?: string[];
};

export function formFieldsToJsonSchema(fields: FormFieldInput[]): JsonSchema {
	const sorted = [...fields].sort((a, b) => a.order - b.order);
	const properties: Record<string, JsonSchemaProperty> = {};
	const required: string[] = [];

	for (let i = 0; i < sorted.length; i++) {
		const f = sorted[i];
		const key = `field_${i}`;

		let schema: JsonSchemaProperty;
		switch (f.type) {
			case "email":
				schema = { type: "string", format: "email" };
				break;
			case "number":
				schema = { type: "number" };
				break;
			case "checkbox":
				schema = { type: "boolean" };
				break;
			case "select": {
				const opts = f.options
					? ((): string[] => {
							try {
								return JSON.parse(f.options!) as string[];
							} catch {
								return [];
							}
						})()
					: [];
				schema =
					opts.length > 0 ? { type: "string", enum: opts } : { type: "string" };
				break;
			}
			case "textarea":
				schema = { type: "string", "x-formflip-ui": "textarea" };
				break;
			case "text":
			default:
				schema = { type: "string" };
		}

		properties[key] = {
			...schema,
			title: f.label,
			...(f.placeholder ? { description: f.placeholder } : {}),
		};
		if (f.required) required.push(key);
	}

	return {
		type: "object",
		properties,
		required: required.length > 0 ? required : undefined,
	};
}

export function jsonSchemaToFormFields(schema: unknown): FormFieldDisplay[] {
	if (!schema || typeof schema !== "object") return [];
	const s = schema as JsonSchema;
	if (s.type !== "object" || !s.properties) return [];

	const requiredSet = new Set(s.required ?? []);
	const entries = Object.entries(s.properties);

	return entries.map(([key, prop], index) => {
		let type: FormFieldType = "text";
		if (prop.type === "number") type = "number";
		else if (prop.type === "boolean") type = "checkbox";
		else if (prop.format === "email") type = "email";
		else if (Array.isArray(prop.enum) && prop.enum.length > 0) type = "select";
		else if ((prop as JsonSchemaProperty)["x-formflip-ui"] === "textarea")
			type = "textarea";
		else if (prop.type === "string") type = "text";

		let options: string[] | null = null;
		if (type === "select" && Array.isArray(prop.enum)) {
			options = prop.enum;
		}

		const label =
			typeof prop.title === "string" ? prop.title : `Field ${index + 1}`;
		const placeholder =
			typeof prop.description === "string" ? prop.description : null;

		return {
			key,
			label,
			type,
			required: requiredSet.has(key),
			order: index,
			placeholder,
			options,
		};
	});
}
