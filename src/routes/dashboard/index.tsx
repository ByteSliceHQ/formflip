import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	Eye,
	EyeOff,
	FileText,
	Inbox,
	Plus,
	Trash2,
} from "lucide-react";
import {
	createForm,
	deleteForm,
	getForms,
	togglePublish,
} from "@/server/forms";
import type { Form, FormField } from "@/db/schema";

export const Route = createFileRoute("/dashboard/")({
	loader: () => getForms(),
	component: DashboardPage,
});

type FormWithMeta = Form & { fields: FormField[]; submissionCount: number };

function DashboardPage() {
	const initialForms = Route.useLoaderData() as FormWithMeta[];
	const [forms, setForms] = useState(initialForms);
	const [showCreateForm, setShowCreateForm] = useState(false);

	const refreshForms = async () => {
		const data = await getForms();
		setForms(data as FormWithMeta[]);
	};

	const totalSubmissions = forms.reduce(
		(sum, f) => sum + f.submissionCount,
		0,
	);
	const publishedCount = forms.filter((f) => f.published).length;

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 py-10">
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-white">Your Forms</h1>
						<p className="mt-1 text-gray-400">
							Create, manage, and collect responses.
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

				{/* Stats bar */}
				{forms.length > 0 && (
					<div className="mb-6 grid grid-cols-3 gap-4">
						<div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3">
							<p className="text-xs text-gray-500">Total Forms</p>
							<p className="text-2xl font-bold text-white">{forms.length}</p>
						</div>
						<div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3">
							<p className="text-xs text-gray-500">Published</p>
							<p className="text-2xl font-bold text-green-400">
								{publishedCount}
							</p>
						</div>
						<div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3">
							<p className="text-xs text-gray-500">Total Submissions</p>
							<p className="text-2xl font-bold text-cyan-400">
								{totalSubmissions}
							</p>
						</div>
					</div>
				)}

				{/* Create form card */}
				{showCreateForm && (
					<CreateFormCard
						onCreated={() => {
							setShowCreateForm(false);
							refreshForms();
						}}
						onCancel={() => setShowCreateForm(false)}
					/>
				)}

				{/* Empty state */}
				{forms.length === 0 && !showCreateForm && (
					<div className="rounded-xl border border-dashed border-slate-700 py-16 text-center">
						<FileText className="mx-auto mb-4 h-12 w-12 text-gray-600" />
						<p className="text-lg text-gray-400">No forms yet.</p>
						<p className="mt-1 text-sm text-gray-500">
							Click "New Form" to get started.
						</p>
					</div>
				)}

				{/* Forms list */}
				<div className="space-y-3">
					{forms.map((form) => (
						<FormCard
							key={form.id}
							form={form}
							onDeleted={refreshForms}
							onToggled={refreshForms}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function FormCard({
	form,
	onDeleted,
	onToggled,
}: {
	form: FormWithMeta;
	onDeleted: () => void;
	onToggled: () => void;
}) {
	const handleDelete = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		await deleteForm({ data: { formId: form.id } });
		onDeleted();
	};

	const handleToggle = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		await togglePublish({ data: { formId: form.id } });
		onToggled();
	};

	return (
		<Link
			to="/dashboard/forms/$formId"
			params={{ formId: String(form.id) }}
			className="block rounded-xl border border-slate-700 bg-slate-800/50 transition-all hover:border-slate-600 hover:shadow-lg hover:shadow-cyan-500/5"
		>
			<div className="flex items-center gap-4 p-5">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h3 className="text-lg font-semibold text-white truncate">
							{form.name}
						</h3>
						{form.published ? (
							<span className="shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
								Published
							</span>
						) : (
							<span className="shrink-0 rounded-full bg-slate-700 px-2 py-0.5 text-xs text-gray-400">
								Draft
							</span>
						)}
					</div>
					{form.description && (
						<p className="mt-0.5 text-sm text-gray-400 truncate">
							{form.description}
						</p>
					)}
					<div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
						<span>{form.fields.length} fields</span>
						<span className="flex items-center gap-1">
							<Inbox size={12} />
							{form.submissionCount} submissions
						</span>
					</div>
				</div>

				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={handleToggle}
						className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-slate-700 hover:text-white"
						title={form.published ? "Unpublish" : "Publish"}
					>
						{form.published ? <Eye size={16} /> : <EyeOff size={16} />}
					</button>
					<button
						type="button"
						onClick={handleDelete}
						className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
						title="Delete"
					>
						<Trash2 size={16} />
					</button>
				</div>
			</div>
		</Link>
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
		await createForm({
			data: { name: name.trim(), description: description.trim() || undefined },
		});
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
