import {
	Link,
	createFileRoute,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import {
	ArrowLeft,
	ChevronDown,
	ChevronUp,
	ClipboardCopy,
	Eye,
	EyeOff,
	GripVertical,
	Pencil,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import {
	createFormField,
	deleteForm,
	deleteFormField,
	deleteSubmission,
	getForm,
	getFormSubmissions,
	togglePublish,
	updateForm,
	updateFormField,
} from "@/server/forms";
import type { Form, FormField } from "@/db/schema";

export const Route = createFileRoute("/dashboard/forms/$formId")({
	loader: async ({ params }) => {
		const formId = Number(params.formId);
		const [form, submissions] = await Promise.all([
			getForm({ data: { formId } }),
			getFormSubmissions({ data: { formId } }),
		]);
		if (!form) throw redirect({ to: "/dashboard" });
		return { form, submissions };
	},
	component: FormDetailPage,
});

type FormWithFields = Form & { fields: FormField[] };

const FIELD_TYPES = [
	"text",
	"email",
	"number",
	"textarea",
	"checkbox",
	"select",
] as const;

function FormDetailPage() {
	const navigate = useNavigate();
	const initialData = Route.useLoaderData();
	const [form, setForm] = useState<FormWithFields>(
		initialData.form as FormWithFields,
	);
	const [submissions, setSubmissions] = useState(initialData.submissions);
	const [tab, setTab] = useState<"fields" | "submissions">("fields");
	const [editing, setEditing] = useState(false);
	const [copied, setCopied] = useState(false);

	const shareUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/f/${form.slug}`
			: `/f/${form.slug}`;

	const refreshForm = async () => {
		const data = await getForm({ data: { formId: form.id } });
		if (data) setForm(data as FormWithFields);
	};

	const refreshSubmissions = async () => {
		const data = await getFormSubmissions({ data: { formId: form.id } });
		setSubmissions(data);
	};

	const handleTogglePublish = async () => {
		const updated = await togglePublish({ data: { formId: form.id } });
		if (updated) setForm({ ...form, published: updated.published });
	};

	const handleDelete = async () => {
		await deleteForm({ data: { formId: form.id } });
		navigate({ to: "/dashboard" });
	};

	const handleCopyLink = () => {
		navigator.clipboard.writeText(shareUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 py-10">
			<div className="mx-auto max-w-4xl">
				{/* Back link */}
				<Link
					to="/dashboard"
					className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
				>
					<ArrowLeft size={16} />
					Back to Dashboard
				</Link>

				{/* Form header */}
				<div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							{editing ? (
								<EditFormInline
									form={form}
									onSaved={() => {
										setEditing(false);
										refreshForm();
									}}
									onCancel={() => setEditing(false)}
								/>
							) : (
								<>
									<h1 className="text-2xl font-bold text-white">{form.name}</h1>
									{form.description && (
										<p className="mt-1 text-gray-400">{form.description}</p>
									)}
								</>
							)}
						</div>
						{!editing && (
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => setEditing(true)}
									className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-slate-700 hover:text-white"
								>
									<Pencil size={16} />
								</button>
								<button
									type="button"
									onClick={handleDelete}
									className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
								>
									<Trash2 size={16} />
								</button>
							</div>
						)}
					</div>

					{/* Publish controls */}
					<div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-700 pt-4">
						<button
							type="button"
							onClick={handleTogglePublish}
							className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
								form.published
									? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
									: "bg-slate-700 text-gray-300 hover:bg-slate-600"
							}`}
						>
							{form.published ? (
								<>
									<Eye size={16} /> Published
								</>
							) : (
								<>
									<EyeOff size={16} /> Draft
								</>
							)}
						</button>

						{form.published && (
							<>
								<code className="rounded bg-slate-700 px-3 py-1.5 text-xs text-gray-300">
									{shareUrl}
								</code>
								<button
									type="button"
									onClick={handleCopyLink}
									className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-slate-600 hover:text-white"
								>
									<ClipboardCopy size={14} />
									{copied ? "Copied!" : "Copy link"}
								</button>
							</>
						)}

						<span className="ml-auto text-sm text-gray-500">
							{submissions.length} submission
							{submissions.length !== 1 ? "s" : ""}
						</span>
					</div>
				</div>

				{/* Tab bar */}
				<div className="mb-6 flex gap-1 rounded-lg bg-slate-800/50 p-1">
					<button
						type="button"
						onClick={() => setTab("fields")}
						className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
							tab === "fields"
								? "bg-slate-700 text-white"
								: "text-gray-400 hover:text-white"
						}`}
					>
						Fields ({form.fields.length})
					</button>
					<button
						type="button"
						onClick={() => setTab("submissions")}
						className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
							tab === "submissions"
								? "bg-slate-700 text-white"
								: "text-gray-400 hover:text-white"
						}`}
					>
						Submissions ({submissions.length})
					</button>
				</div>

				{/* Tab content */}
				{tab === "fields" ? (
					<FieldsTab form={form} onFieldsChanged={refreshForm} />
				) : (
					<SubmissionsTab
						form={form}
						submissions={submissions}
						onDeleted={refreshSubmissions}
					/>
				)}
			</div>
		</div>
	);
}

// ─── Edit Form Inline ──────────────────────────────────────────────

function EditFormInline({
	form,
	onSaved,
	onCancel,
}: { form: Form; onSaved: () => void; onCancel: () => void }) {
	const [name, setName] = useState(form.name);
	const [description, setDescription] = useState(form.description ?? "");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		setLoading(true);
		await updateForm({
			data: {
				formId: form.id,
				name: name.trim(),
				description: description.trim() || undefined,
			},
		});
		setLoading(false);
		onSaved();
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<input
				type="text"
				value={name}
				onChange={(e) => setName(e.target.value)}
				className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
				autoFocus
			/>
			<input
				type="text"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				placeholder="Description (optional)"
				className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
			/>
			<div className="flex gap-2">
				<button
					type="submit"
					disabled={loading || !name.trim()}
					className="rounded-lg bg-cyan-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
				>
					{loading ? "Saving..." : "Save"}
				</button>
				<button
					type="button"
					onClick={onCancel}
					className="rounded-lg border border-slate-600 px-4 py-1.5 text-sm text-gray-300 hover:text-white"
				>
					Cancel
				</button>
			</div>
		</form>
	);
}

// ─── Fields Tab ────────────────────────────────────────────────────

function FieldsTab({
	form,
	onFieldsChanged,
}: { form: FormWithFields; onFieldsChanged: () => void }) {
	const [showAddField, setShowAddField] = useState(false);

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-white">Form Fields</h2>
				<button
					type="button"
					onClick={() => setShowAddField(true)}
					className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
				>
					<Plus size={16} />
					Add Field
				</button>
			</div>

			{form.fields.length === 0 && !showAddField && (
				<div className="rounded-xl border border-dashed border-slate-700 py-12 text-center">
					<p className="text-gray-400">No fields yet.</p>
					<p className="mt-1 text-sm text-gray-500">
						Add fields to start collecting responses.
					</p>
				</div>
			)}

			<div className="space-y-2">
				{form.fields.map((field) => (
					<FieldRow
						key={field.id}
						field={field}
						onChanged={onFieldsChanged}
					/>
				))}
			</div>

			{showAddField && (
				<AddFieldForm
					formId={form.id}
					nextOrder={form.fields.length}
					onAdded={() => {
						setShowAddField(false);
						onFieldsChanged();
					}}
					onCancel={() => setShowAddField(false)}
				/>
			)}
		</div>
	);
}

function FieldRow({
	field,
	onChanged,
}: { field: FormField; onChanged: () => void }) {
	const [editing, setEditing] = useState(false);
	const [label, setLabel] = useState(field.label);
	const [type, setType] = useState(field.type);
	const [required, setRequired] = useState(field.required);
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		setLoading(true);
		await updateFormField({
			data: { fieldId: field.id, label, type, required },
		});
		setLoading(false);
		setEditing(false);
		onChanged();
	};

	if (editing) {
		return (
			<div className="flex flex-wrap items-center gap-2 rounded-lg border border-cyan-500/30 bg-slate-800/50 p-3">
				<input
					type="text"
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					className="flex-1 rounded border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
					autoFocus
				/>
				<select
					value={type}
					onChange={(e) => setType(e.target.value)}
					className="rounded border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
				>
					{FIELD_TYPES.map((t) => (
						<option key={t} value={t}>
							{t}
						</option>
					))}
				</select>
				<label className="flex items-center gap-1.5 text-sm text-gray-300">
					<input
						type="checkbox"
						checked={required}
						onChange={(e) => setRequired(e.target.checked)}
						className="rounded border-slate-600"
					/>
					Required
				</label>
				<button
					type="button"
					onClick={handleSave}
					disabled={loading || !label.trim()}
					className="rounded bg-cyan-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
				>
					{loading ? "..." : "Save"}
				</button>
				<button
					type="button"
					onClick={() => {
						setLabel(field.label);
						setType(field.type);
						setRequired(field.required);
						setEditing(false);
					}}
					className="rounded p-1.5 text-gray-400 hover:text-white"
				>
					<X size={14} />
				</button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3">
			<GripVertical size={14} className="text-gray-600" />
			<span className="flex-1 text-sm text-white">{field.label}</span>
			<span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-gray-400">
				{field.type}
			</span>
			{field.required && (
				<span className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300">
					required
				</span>
			)}
			<button
				type="button"
				onClick={() => setEditing(true)}
				className="rounded p-1 text-gray-400 transition-colors hover:text-white"
			>
				<Pencil size={14} />
			</button>
			<button
				type="button"
				onClick={async () => {
					await deleteFormField({ data: { fieldId: field.id } });
					onChanged();
				}}
				className="rounded p-1 text-gray-400 transition-colors hover:text-red-400"
			>
				<Trash2 size={14} />
			</button>
		</div>
	);
}

function AddFieldForm({
	formId,
	nextOrder,
	onAdded,
	onCancel,
}: {
	formId: number;
	nextOrder: number;
	onAdded: () => void;
	onCancel: () => void;
}) {
	const [label, setLabel] = useState("");
	const [type, setType] = useState<string>("text");
	const [required, setRequired] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!label.trim()) return;
		setLoading(true);
		await createFormField({
			data: {
				formId,
				label: label.trim(),
				type,
				required,
				order: nextOrder,
			},
		});
		setLoading(false);
		onAdded();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-600 p-3"
		>
			<input
				type="text"
				placeholder="Field label"
				value={label}
				onChange={(e) => setLabel(e.target.value)}
				className="flex-1 rounded border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
				autoFocus
			/>
			<select
				value={type}
				onChange={(e) => setType(e.target.value)}
				className="rounded border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
			>
				{FIELD_TYPES.map((t) => (
					<option key={t} value={t}>
						{t}
					</option>
				))}
			</select>
			<label className="flex items-center gap-1.5 text-sm text-gray-300">
				<input
					type="checkbox"
					checked={required}
					onChange={(e) => setRequired(e.target.checked)}
					className="rounded border-slate-600"
				/>
				Required
			</label>
			<button
				type="submit"
				disabled={loading || !label.trim()}
				className="rounded bg-cyan-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
			>
				{loading ? "Adding..." : "Add"}
			</button>
			<button
				type="button"
				onClick={onCancel}
				className="rounded p-1.5 text-gray-400 hover:text-white"
			>
				<X size={14} />
			</button>
		</form>
	);
}

// ─── Submissions Tab ───────────────────────────────────────────────

type SubmissionWithValues = {
	id: number;
	formId: number;
	submittedAt: Date;
	values: Array<{
		id: number;
		value: string;
		field: FormField;
	}>;
};

function SubmissionsTab({
	form,
	submissions,
	onDeleted,
}: {
	form: FormWithFields;
	submissions: SubmissionWithValues[];
	onDeleted: () => void;
}) {
	const [expandedId, setExpandedId] = useState<number | null>(null);

	if (submissions.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-slate-700 py-12 text-center">
				<p className="text-gray-400">No submissions yet.</p>
				<p className="mt-1 text-sm text-gray-500">
					{form.published
						? "Share your form to start collecting responses."
						: "Publish your form to start collecting responses."}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-white">Submissions</h2>
				<span className="text-sm text-gray-500">
					{submissions.length} total
				</span>
			</div>

			{submissions.map((sub) => (
				<div
					key={sub.id}
					className="rounded-lg border border-slate-700 bg-slate-800/50"
				>
					<div className="flex items-center justify-between px-4 py-3">
						<button
							type="button"
							onClick={() =>
								setExpandedId(expandedId === sub.id ? null : sub.id)
							}
							className="flex flex-1 items-center gap-2 text-left"
						>
							{expandedId === sub.id ? (
								<ChevronUp size={16} className="text-gray-400" />
							) : (
								<ChevronDown size={16} className="text-gray-400" />
							)}
							<span className="text-sm text-white">
								Submission #{sub.id}
							</span>
							<span className="text-xs text-gray-500">
								{new Date(sub.submittedAt).toLocaleString()}
							</span>
						</button>
						<button
							type="button"
							onClick={async () => {
								await deleteSubmission({
									data: { submissionId: sub.id },
								});
								onDeleted();
							}}
							className="rounded p-1 text-gray-400 transition-colors hover:text-red-400"
						>
							<Trash2 size={14} />
						</button>
					</div>

					{expandedId === sub.id && (
						<div className="border-t border-slate-700 px-4 py-3">
							<div className="space-y-2">
								{sub.values.map((v) => (
									<div key={v.id} className="flex gap-3">
										<span className="min-w-32 text-xs font-medium text-gray-400">
											{v.field.label}
										</span>
										<span className="text-sm text-white">{v.value}</span>
									</div>
								))}
								{sub.values.length === 0 && (
									<p className="text-sm text-gray-500">No values recorded.</p>
								)}
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
