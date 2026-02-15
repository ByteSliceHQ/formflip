import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle, Send } from "lucide-react";
import { getPublicForm, submitForm } from "@/server/forms";
import type { FormField } from "@/db/schema";

export const Route = createFileRoute("/f/$slug")({
	loader: ({ params }) => getPublicForm({ data: { slug: params.slug } }),
	component: PublicFormPage,
});

function PublicFormPage() {
	const form = Route.useLoaderData();
	const { slug } = Route.useParams();
	const [values, setValues] = useState<Record<string, string>>({});
	const [error, setError] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	if (!form) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-white">Form not found</h1>
					<p className="mt-2 text-gray-400">
						This form doesn't exist or is no longer accepting responses.
					</p>
				</div>
			</div>
		);
	}

	if (submitted) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6">
				<div className="w-full max-w-lg text-center">
					<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
						<CheckCircle className="h-8 w-8 text-green-400" />
					</div>
					<h1 className="text-2xl font-bold text-white">
						Response submitted
					</h1>
					<p className="mt-2 text-gray-400">
						Thank you for filling out {form.name}.
					</p>
					<button
						type="button"
						onClick={() => {
							setValues({});
							setSubmitted(false);
						}}
						className="mt-6 rounded-lg border border-slate-600 px-6 py-2 text-sm text-gray-300 transition-colors hover:border-slate-500 hover:text-white"
					>
						Submit another response
					</button>
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

	const setValue = (fieldId: number, value: string) => {
		setValues((prev) => ({ ...prev, [String(fieldId)]: value }));
	};

	return (
		<div className="flex min-h-screen items-start justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 py-12">
			<div className="w-full max-w-lg">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white">{form.name}</h1>
					{form.description && (
						<p className="mt-2 text-gray-400">{form.description}</p>
					)}
				</div>

				<form
					onSubmit={handleSubmit}
					className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
				>
					{error && (
						<div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
							{error}
						</div>
					)}

					<div className="space-y-5">
						{form.fields.map((field: FormField) => (
							<FieldInput
								key={field.id}
								field={field}
								value={values[String(field.id)] ?? ""}
								onChange={(val) => setValue(field.id, val)}
							/>
						))}
					</div>

					{form.fields.length === 0 && (
						<p className="py-8 text-center text-gray-500">
							This form has no fields yet.
						</p>
					)}

					{form.fields.length > 0 && (
						<button
							type="submit"
							disabled={loading}
							className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
						>
							{loading ? (
								"Submitting..."
							) : (
								<>
									<Send size={16} />
									Submit
								</>
							)}
						</button>
					)}
				</form>

				<p className="mt-6 text-center text-xs text-gray-600">
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
	field: FormField;
	value: string;
	onChange: (val: string) => void;
}) {
	const baseClass =
		"w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none";

	return (
		<div>
			<label
				htmlFor={`field-${field.id}`}
				className="mb-1.5 block text-sm font-medium text-gray-300"
			>
				{field.label}
				{field.required && <span className="ml-1 text-red-400">*</span>}
			</label>

			{field.type === "textarea" ? (
				<textarea
					id={`field-${field.id}`}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required={field.required}
					rows={4}
					className={baseClass}
					placeholder={field.placeholder ?? undefined}
				/>
			) : field.type === "checkbox" ? (
				<label className="flex items-center gap-2 text-sm text-gray-300">
					<input
						type="checkbox"
						checked={value === "true"}
						onChange={(e) => onChange(e.target.checked ? "true" : "false")}
						className="rounded border-slate-600 bg-slate-700"
					/>
					{field.placeholder ?? "Yes"}
				</label>
			) : field.type === "select" ? (
				<select
					id={`field-${field.id}`}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required={field.required}
					className={baseClass}
				>
					<option value="">Select an option</option>
					{(() => {
						try {
							const opts = JSON.parse(field.options ?? "[]") as string[];
							return opts.map((opt) => (
								<option key={opt} value={opt}>
									{opt}
								</option>
							));
						} catch {
							return null;
						}
					})()}
				</select>
			) : (
				<input
					id={`field-${field.id}`}
					type={field.type}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required={field.required}
					className={baseClass}
					placeholder={field.placeholder ?? undefined}
				/>
			)}
		</div>
	);
}
