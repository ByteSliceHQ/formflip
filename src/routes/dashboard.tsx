import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { useState } from "react";
import {
	ChevronDown,
	ChevronUp,
	GripVertical,
	Pencil,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import {
	createForm,
	createFormField,
	deleteForm,
	deleteFormField,
	getForms,
	updateForm,
	updateFormField,
} from "@/server/forms";
import { auth } from "@/lib/auth";
import type { Form, FormField } from "@/db/schema";

const authGuard = createServerFn({ method: "GET" }).handler(async () => {
	const request = getRequest();
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		throw redirect({ to: "/" });
	}
	return { userId: session.user.id };
});

export const Route = createFileRoute("/dashboard")({
	beforeLoad: () => authGuard(),
	loader: () => getForms(),
	component: DashboardPage,
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

function DashboardPage() {
	const initialForms = Route.useLoaderData() as FormWithFields[];
	const [forms, setForms] = useState(initialForms);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingFormId, setEditingFormId] = useState<number | null>(null);
	const [expandedFormId, setExpandedFormId] = useState<number | null>(null);

	const refreshForms = async () => {
		const data = await getForms();
		setForms(data as FormWithFields[]);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 py-10">
			<div className="mx-auto max-w-4xl">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-white">Your Forms</h1>
						<p className="mt-1 text-gray-400">
							Create and manage your AI-driven forms.
						</p>
					</div>
					<button
						type="button"
						onClick={() => setShowCreateForm(true)}
						className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
					>
						<Plus size={18} />
						New Form
					</button>
				</div>

				{showCreateForm && (
					<CreateFormCard
						onCreated={() => {
							setShowCreateForm(false);
							refreshForms();
						}}
						onCancel={() => setShowCreateForm(false)}
					/>
				)}

				{forms.length === 0 && !showCreateForm && (
					<div className="rounded-xl border border-dashed border-slate-700 py-16 text-center">
						<p className="text-lg text-gray-400">No forms yet.</p>
						<p className="mt-1 text-sm text-gray-500">
							Click "New Form" to get started.
						</p>
					</div>
				)}

				<div className="space-y-4">
					{forms.map((form) => (
						<div
							key={form.id}
							className="rounded-xl border border-slate-700 bg-slate-800/50"
						>
							{/* Form header */}
							<div className="flex items-center justify-between p-5">
								<button
									type="button"
									onClick={() =>
										setExpandedFormId(
											expandedFormId === form.id ? null : form.id,
										)
									}
									className="flex flex-1 items-center gap-3 text-left"
								>
									{expandedFormId === form.id ? (
										<ChevronUp size={18} className="text-gray-400" />
									) : (
										<ChevronDown size={18} className="text-gray-400" />
									)}
									<div>
										<h3 className="text-lg font-semibold text-white">
											{form.name}
										</h3>
										{form.description && (
											<p className="text-sm text-gray-400">
												{form.description}
											</p>
										)}
									</div>
								</button>
								<div className="flex items-center gap-2">
									<span className="mr-2 rounded-full bg-slate-700 px-3 py-1 text-xs text-gray-300">
										{form.fields.length} field
										{form.fields.length !== 1 ? "s" : ""}
									</span>
									<button
										type="button"
										onClick={() => setEditingFormId(form.id)}
										className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-slate-700 hover:text-white"
									>
										<Pencil size={16} />
									</button>
									<button
										type="button"
										onClick={async () => {
											await deleteForm({ data: { formId: form.id } });
											refreshForms();
										}}
										className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>

							{/* Edit form name/description inline */}
							{editingFormId === form.id && (
								<EditFormCard
									form={form}
									onSaved={() => {
										setEditingFormId(null);
										refreshForms();
									}}
									onCancel={() => setEditingFormId(null)}
								/>
							)}

							{/* Expanded: show fields */}
							{expandedFormId === form.id && (
								<FormFieldsPanel
									form={form}
									onFieldsChanged={refreshForms}
								/>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function CreateFormCard({
	onCreated,
	onCancel,
}: { onCreated: () => void; onCancel: () => void }) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		setLoading(true);
		await createForm({ data: { name: name.trim(), description: description.trim() || undefined } });
		setLoading(false);
		onCreated();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mb-6 rounded-xl border border-cyan-500/30 bg-slate-800/50 p-5"
		>
			<h3 className="mb-4 text-lg font-semibold text-white">
				Create New Form
			</h3>
			<div className="space-y-3">
				<input
					type="text"
					placeholder="Form name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
					autoFocus
				/>
				<input
					type="text"
					placeholder="Description (optional)"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
				/>
			</div>
			<div className="mt-4 flex justify-end gap-2">
				<button
					type="button"
					onClick={onCancel}
					className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-slate-500 hover:text-white"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={loading || !name.trim()}
					className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
				>
					{loading ? "Creating..." : "Create"}
				</button>
			</div>
		</form>
	);
}

function EditFormCard({
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
			data: { formId: form.id, name: name.trim(), description: description.trim() || undefined },
		});
		setLoading(false);
		onSaved();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="border-t border-slate-700 bg-slate-800/30 px-5 py-4"
		>
			<div className="space-y-3">
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
			</div>
			<div className="mt-3 flex justify-end gap-2">
				<button
					type="button"
					onClick={onCancel}
					className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-gray-300 hover:text-white"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={loading || !name.trim()}
					className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
				>
					{loading ? "Saving..." : "Save"}
				</button>
			</div>
		</form>
	);
}

function FormFieldsPanel({
	form,
	onFieldsChanged,
}: { form: FormWithFields; onFieldsChanged: () => void }) {
	const [showAddField, setShowAddField] = useState(false);

	return (
		<div className="border-t border-slate-700 px-5 py-4">
			<div className="mb-3 flex items-center justify-between">
				<h4 className="text-sm font-semibold text-gray-300">Fields</h4>
				<button
					type="button"
					onClick={() => setShowAddField(true)}
					className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-slate-600 hover:text-white"
				>
					<Plus size={14} />
					Add Field
				</button>
			</div>

			{form.fields.length === 0 && !showAddField && (
				<p className="py-4 text-center text-sm text-gray-500">
					No fields yet. Add your first field.
				</p>
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
			<div className="flex flex-wrap items-center gap-2 rounded-lg border border-cyan-500/30 bg-slate-700/50 p-3">
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
		<div className="flex items-center gap-3 rounded-lg bg-slate-700/30 px-3 py-2.5">
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
			className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-600 p-3"
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
