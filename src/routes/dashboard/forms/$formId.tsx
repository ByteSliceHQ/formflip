import {
	queryOptions,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
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
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
	createFormField,
	deleteForm,
	deleteFormField,
	deleteSubmission,
	type FormDisplay,
	type FormFieldDisplay,
	type FormSubmissionDisplay,
	getForm,
	getFormSubmissions,
	togglePublish,
	updateForm,
	updateFormField,
} from "@/server/forms";

const formQueryOptions = (formId: number) =>
	queryOptions({
		queryKey: ["form", formId],
		queryFn: () => getForm({ data: { formId } }),
	});

const formSubmissionsQueryOptions = (formId: number) =>
	queryOptions({
		queryKey: ["formSubmissions", formId],
		queryFn: () => getFormSubmissions({ data: { formId } }),
	});

export const Route = createFileRoute("/dashboard/forms/$formId")({
	loader: async ({ params, context }) => {
		const formId = Number(params.formId);
		const [form] = await Promise.all([
			context.queryClient.ensureQueryData(formQueryOptions(formId)),
			context.queryClient.ensureQueryData(formSubmissionsQueryOptions(formId)),
		]);

		if (!form) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: FormDetailPage,
});

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
	const queryClient = useQueryClient();
	const { formId } = Route.useParams();
	const formIdNum = Number(formId);
	const { data: form } = useSuspenseQuery(formQueryOptions(formIdNum));
	const { data: submissions } = useSuspenseQuery(
		formSubmissionsQueryOptions(formIdNum),
	);
	const [tab, setTab] = useState<"fields" | "submissions">("fields");
	const [editing, setEditing] = useState(false);
	const [copied, setCopied] = useState(false);

	if (!form) {
		throw redirect({ to: "/dashboard" });
	}

	const shareUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/f/${form.slug}`
			: `/f/${form.slug}`;

	const refreshForm = () =>
		queryClient.invalidateQueries({ queryKey: ["form", formIdNum] });

	const refreshSubmissions = () =>
		queryClient.invalidateQueries({
			queryKey: ["formSubmissions", formIdNum],
		});

	const handleTogglePublish = async () => {
		await togglePublish({ data: { formId: form.id } });
		refreshForm();
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
		<div className="min-h-screen bg-dot-grid px-6 py-10">
			<div className="mx-auto max-w-4xl">
				{/* Back link */}
				<Link
					to="/dashboard"
					className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft size={16} />
					Back to Dashboard
				</Link>

				{/* Form header */}
				<div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-warm">
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
									<h1 className="font-display text-2xl font-semibold italic text-foreground">
										{form.name}
									</h1>
									{form.description && (
										<p className="mt-1 text-muted-foreground">
											{form.description}
										</p>
									)}
								</>
							)}
						</div>
						{!editing && (
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => setEditing(true)}
								>
									<Pencil size={16} />
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={handleDelete}
									className="hover:bg-destructive/10 hover:text-destructive"
								>
									<Trash2 size={16} />
								</Button>
							</div>
						)}
					</div>

					{/* Publish controls */}
					<div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={handleTogglePublish}
							className={
								form.published
									? "gap-2 bg-chart-2/20 text-chart-2 hover:bg-chart-2/30"
									: "gap-2"
							}
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
						</Button>

						{form.published && (
							<>
								<code className="font-mono rounded bg-muted px-3 py-1.5 text-xs text-foreground">
									{shareUrl}
								</code>
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={handleCopyLink}
									className="gap-1.5"
								>
									<ClipboardCopy size={14} />
									{copied ? "Copied!" : "Copy link"}
								</Button>
							</>
						)}

						<span className="ml-auto text-sm text-muted-foreground">
							{submissions.length} submission
							{submissions.length !== 1 ? "s" : ""}
						</span>
					</div>
				</div>

				{/* Tab bar */}
				<div className="mb-6 flex gap-1 rounded-lg bg-muted/50 p-1">
					<Button
						type="button"
						variant={tab === "fields" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setTab("fields")}
						className="flex-1"
					>
						Fields ({form.fields.length})
					</Button>
					<Button
						type="button"
						variant={tab === "submissions" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setTab("submissions")}
						className="flex-1"
					>
						Submissions ({submissions.length})
					</Button>
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
}: {
	form: FormDisplay;
	onSaved: () => void;
	onCancel: () => void;
}) {
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
			<Input
				type="text"
				value={name}
				onChange={(e) => setName(e.target.value)}
				autoFocus
			/>
			<Input
				type="text"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				placeholder="Description (optional)"
			/>
			<div className="flex gap-2">
				<Button type="submit" size="sm" disabled={loading || !name.trim()}>
					{loading ? "Saving..." : "Save"}
				</Button>
				<Button type="button" variant="outline" size="sm" onClick={onCancel}>
					Cancel
				</Button>
			</div>
		</form>
	);
}

// ─── Fields Tab ────────────────────────────────────────────────────

function FieldsTab({
	form,
	onFieldsChanged,
}: {
	form: FormDisplay;
	onFieldsChanged: () => void;
}) {
	const [showAddField, setShowAddField] = useState(false);

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="font-display text-lg font-semibold italic text-foreground">
					Form Fields
				</h2>
				<Button
					type="button"
					size="sm"
					onClick={() => setShowAddField(true)}
					className="gap-2"
				>
					<Plus size={16} />
					Add Field
				</Button>
			</div>

			{form.fields.length === 0 && !showAddField && (
				<div className="rounded-xl border border-dashed border-border py-12 text-center">
					<p className="text-muted-foreground">No fields yet.</p>
					<p className="mt-1 text-sm text-muted-foreground">
						Add fields to start collecting responses.
					</p>
				</div>
			)}

			<div className="space-y-2">
				{form.fields.map((field) => (
					<FieldRow
						key={field.key}
						formId={form.id}
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
	formId,
	field,
	onChanged,
}: {
	formId: number;
	field: FormFieldDisplay;
	onChanged: () => void;
}) {
	const [editing, setEditing] = useState(false);
	const [label, setLabel] = useState(field.label);
	const [type, setType] = useState(field.type);
	const [required, setRequired] = useState(field.required);
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		setLoading(true);
		await updateFormField({
			data: {
				formId,
				fieldKey: field.key,
				label,
				type,
				required,
			},
		});
		setLoading(false);
		setEditing(false);
		onChanged();
	};

	if (editing) {
		return (
			<div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-card p-3">
				<Input
					type="text"
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					className="flex-1"
					autoFocus
				/>
				<Select
					value={type}
					onValueChange={(v) => setType(v as (typeof FIELD_TYPES)[number])}
				>
					<SelectTrigger className="w-[120px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{FIELD_TYPES.map((t) => (
							<SelectItem key={t} value={t}>
								{t}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<div className="flex items-center gap-1.5">
					<Checkbox
						id={`field-required-${field.key}`}
						checked={required}
						onCheckedChange={(c) => setRequired(c === true)}
					/>
					<Label
						htmlFor={`field-required-${field.key}`}
						className="cursor-pointer text-sm font-normal text-foreground"
					>
						Required
					</Label>
				</div>
				<Button
					type="button"
					size="sm"
					onClick={handleSave}
					disabled={loading || !label.trim()}
					className="text-xs"
				>
					{loading ? "..." : "Save"}
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => {
						setLabel(field.label);
						setType(field.type);
						setRequired(field.required);
						setEditing(false);
					}}
				>
					<X size={14} />
				</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
			<GripVertical size={14} className="text-muted-foreground" />
			<span className="flex-1 text-sm text-foreground">{field.label}</span>
			<span className="font-mono rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
				{field.type}
			</span>
			{field.required && (
				<span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">
					required
				</span>
			)}
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={() => setEditing(true)}
			>
				<Pencil size={14} />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={async () => {
					await deleteFormField({
						data: { formId, fieldKey: field.key },
					});
					onChanged();
				}}
				className="hover:text-destructive"
			>
				<Trash2 size={14} />
			</Button>
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
	const requiredId = useId();
	const [label, setLabel] = useState("");
	const [type, setType] = useState<(typeof FIELD_TYPES)[number]>("text");
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
			className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border p-3"
		>
			<Input
				type="text"
				placeholder="Field label"
				value={label}
				onChange={(e) => setLabel(e.target.value)}
				className="flex-1"
				autoFocus
			/>
			<Select
				value={type}
				onValueChange={(v) => setType(v as (typeof FIELD_TYPES)[number])}
			>
				<SelectTrigger className="w-[120px]">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{FIELD_TYPES.map((t) => (
						<SelectItem key={t} value={t}>
							{t}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<div className="flex items-center gap-1.5">
				<Checkbox
					id={requiredId}
					checked={required}
					onCheckedChange={(c) => setRequired(c === true)}
				/>
				<Label
					htmlFor={requiredId}
					className="cursor-pointer text-sm font-normal text-foreground"
				>
					Required
				</Label>
			</div>
			<Button
				type="submit"
				size="sm"
				disabled={loading || !label.trim()}
				className="text-xs"
			>
				{loading ? "Adding..." : "Add"}
			</Button>
			<Button type="button" variant="ghost" size="icon" onClick={onCancel}>
				<X size={14} />
			</Button>
		</form>
	);
}

// ─── Submissions Tab ───────────────────────────────────────────────

function SubmissionsTab({
	form,
	submissions,
	onDeleted,
}: {
	form: FormDisplay;
	submissions: FormSubmissionDisplay[];
	onDeleted: () => void;
}) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	if (submissions.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border py-12 text-center">
				<p className="text-muted-foreground">No submissions yet.</p>
				<p className="mt-1 text-sm text-muted-foreground">
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
				<h2 className="font-display text-lg font-semibold italic text-foreground">
					Submissions
				</h2>
				<span className="text-sm text-muted-foreground">
					{submissions.length} total
				</span>
			</div>

			{submissions.map((sub) => (
				<div key={sub.id} className="rounded-lg border border-border bg-card">
					<div className="flex items-center justify-between px-4 py-3">
						<Button
							type="button"
							variant="ghost"
							onClick={() =>
								setExpandedId(expandedId === sub.id ? null : sub.id)
							}
							className="flex flex-1 items-center justify-start gap-2"
						>
							{expandedId === sub.id ? (
								<ChevronUp size={16} className="text-muted-foreground" />
							) : (
								<ChevronDown size={16} className="text-muted-foreground" />
							)}
							<span className="text-sm text-foreground">Submission</span>
							<span className="text-xs text-muted-foreground">
								{new Date(sub.submittedAt).toLocaleString()}
							</span>
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={async () => {
								await deleteSubmission({
									data: { submissionId: String(sub.id) },
								});
								onDeleted();
							}}
							className="hover:text-destructive"
						>
							<Trash2 size={14} />
						</Button>
					</div>

					{expandedId === sub.id && (
						<div className="border-t border-border px-4 py-3">
							<div className="space-y-2">
								{sub.values.map((v) => (
									<div key={v.field.key} className="flex gap-3">
										<span className="min-w-32 text-xs font-medium text-muted-foreground">
											{v.field.label}
										</span>
										<span className="text-sm text-foreground">{v.value}</span>
									</div>
								))}
								{sub.values.length === 0 && (
									<p className="text-sm text-muted-foreground">
										No values recorded.
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
