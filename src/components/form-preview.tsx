import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormFieldDisplay } from "@/server/forms";

export type FormPreviewForm = {
	name: string;
	description: string | null;
	fields: FormFieldDisplay[];
};

export function FormPreview({
	form,
	values: controlledValues,
	onValueChange,
}: {
	form: FormPreviewForm;
	values?: Record<string, string>;
	onValueChange?: (fieldKey: string, value: string) => void;
}) {
	const [internalValues, setInternalValues] = useState<Record<string, string>>(
		() => ({}),
	);

	const isControlled = onValueChange != null;
	const values = isControlled ? (controlledValues ?? {}) : internalValues;
	const setValue = isControlled
		? (fieldKey: string, value: string) => onValueChange(fieldKey, value)
		: (fieldKey: string, value: string) =>
				setInternalValues((prev) => ({ ...prev, [fieldKey]: value }));

	return (
		<div className="space-y-5">
			<div>
				<h2 className="font-display text-2xl font-semibold italic text-foreground">
					{form.name}
				</h2>
				{form.description && (
					<p className="mt-2 text-muted-foreground">{form.description}</p>
				)}
			</div>

			<div className="space-y-5">
				{form.fields.map((field) => (
					<FormPreviewFieldInput
						key={field.key}
						field={field}
						value={values[field.key] ?? ""}
						onChange={(val) => setValue(field.key, val)}
					/>
				))}
			</div>

			{form.fields.length === 0 && (
				<p className="py-8 text-center text-muted-foreground">
					This form has no fields yet.
				</p>
			)}
		</div>
	);
}

function FormPreviewFieldInput({
	field,
	value,
	onChange,
}: {
	field: FormFieldDisplay;
	value: string;
	onChange: (val: string) => void;
}) {
	const fieldId = `form-preview-field-${field.key}`;

	return (
		<div className="space-y-2">
			<Label htmlFor={fieldId} className="text-foreground">
				{field.label}
				{field.required && <span className="ml-1 text-destructive">*</span>}
			</Label>

			{field.type === "textarea" ? (
				<Textarea
					id={fieldId}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required={field.required}
					rows={4}
					placeholder={field.placeholder ?? undefined}
				/>
			) : field.type === "checkbox" ? (
				<div className="flex items-center gap-2">
					<Checkbox
						id={fieldId}
						checked={value === "true"}
						onCheckedChange={(checked) =>
							onChange(checked === true ? "true" : "false")
						}
					/>
					<Label
						htmlFor={fieldId}
						className="cursor-pointer text-sm font-normal text-foreground"
					>
						{field.placeholder ?? "Yes"}
					</Label>
				</div>
			) : field.type === "select" ? (
				<Select value={value || undefined} onValueChange={onChange}>
					<SelectTrigger id={fieldId} className="w-full">
						<SelectValue placeholder="Select an option" />
					</SelectTrigger>
					<SelectContent>
						{(field.options ?? []).map((opt) => (
							<SelectItem key={opt} value={opt}>
								{opt}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			) : (
				<Input
					id={fieldId}
					type={field.type}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required={field.required}
					placeholder={field.placeholder ?? undefined}
				/>
			)}
		</div>
	);
}
