import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	getPublicForm,
	submitForm,
	type FormFieldDisplay,
} from "@/server/forms";

const publicFormQueryOptions = (slug: string) =>
	queryOptions({
		queryKey: ["publicForm", slug],
		queryFn: () => getPublicForm({ data: { slug } }),
	});

export const Route = createFileRoute("/f/$slug")({
	loader: ({ params, context }) =>
		context.queryClient.ensureQueryData(publicFormQueryOptions(params.slug)),
	component: PublicFormPage,
});

function PublicFormPage() {
	const { slug } = Route.useParams();
	const { data: form } = useSuspenseQuery(publicFormQueryOptions(slug));
	const [values, setValues] = useState<Record<string, string>>({});
	const [error, setError] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	if (!form) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-dot-grid">
				<div className="text-center">
					<h1 className="font-display text-2xl font-semibold italic text-foreground">
						Form not found
					</h1>
					<p className="mt-2 text-muted-foreground">
						This form doesn't exist or is no longer accepting responses.
					</p>
				</div>
			</div>
		);
	}

	if (submitted) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-dot-grid px-6">
				<div className="w-full max-w-lg text-center">
					<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/20">
						<CheckCircle className="h-8 w-8 text-chart-2" />
					</div>
					<h1 className="font-display text-2xl font-semibold italic text-foreground">
						Response submitted
					</h1>
					<p className="mt-2 text-muted-foreground">
						Thank you for filling out {form.name}.
					</p>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="mt-6"
						onClick={() => {
							setValues({});
							setSubmitted(false);
						}}
					>
						Submit another response
					</Button>
				</div>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const result = await submitForm({ data: { slug, values } });

		setLoading(false);
		if (result.success) {
			setSubmitted(true);
		} else {
			setError(result.error ?? "Submission failed");
		}
	};

	const setValue = (fieldKey: string, value: string) => {
		setValues((prev) => ({ ...prev, [fieldKey]: value }));
	};

	return (
		<div className="flex min-h-screen items-start justify-center bg-dot-grid px-6 py-12">
			<div className="w-full max-w-lg">
				<div className="mb-8">
					<h1 className="font-display text-3xl font-semibold italic text-foreground">
						{form.name}
					</h1>
					{form.description && (
						<p className="mt-2 text-muted-foreground">{form.description}</p>
					)}
				</div>

				<form
					onSubmit={handleSubmit}
					className="rounded-xl border border-border bg-card p-6 shadow-warm"
				>
					{error && (
						<div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
							{error}
						</div>
					)}

					<div className="space-y-5">
						{form.fields.map((field: FormFieldDisplay) => (
							<FieldInput
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

					{form.fields.length > 0 && (
						<Button
							type="submit"
							disabled={loading}
							className="mt-6 w-full gap-2"
						>
							{loading ? (
								"Submitting..."
							) : (
								<>
									<Send size={16} />
									Submit
								</>
							)}
						</Button>
					)}
				</form>

				<p className="mt-6 text-center text-xs text-muted-foreground">
					Powered by FormFlip
				</p>
			</div>
		</div>
	);
}

function FieldInput({
	field,
	value,
	onChange,
}: {
	field: FormFieldDisplay;
	value: string;
	onChange: (val: string) => void;
}) {
	const fieldId = `field-${field.key}`;

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
