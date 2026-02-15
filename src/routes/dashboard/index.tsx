import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, FileText, Inbox, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Form, FormField } from "@/db/schema";
import {
	createForm,
	deleteForm,
	getForms,
	togglePublish,
} from "@/server/forms";

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

	const totalSubmissions = forms.reduce((sum, f) => sum + f.submissionCount, 0);
	const publishedCount = forms.filter((f) => f.published).length;

	return (
		<div className="min-h-screen bg-dot-grid px-6 py-10">
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="font-display text-3xl font-semibold italic text-foreground">
							Your Forms
						</h1>
						<p className="mt-1 text-muted-foreground">
							Create, manage, and collect responses.
						</p>
					</div>
					<Button
						type="button"
						size="sm"
						onClick={() => setShowCreateForm(true)}
						className="gap-2"
					>
						<Plus size={18} />
						New Form
					</Button>
				</div>

				{/* Stats bar */}
				{forms.length > 0 && (
					<div className="mb-6 grid grid-cols-3 gap-4">
						<div className="rounded-lg border border-border bg-card px-4 py-3 shadow-warm">
							<p className="text-xs text-muted-foreground">Total Forms</p>
							<p className="text-2xl font-bold text-foreground">{forms.length}</p>
						</div>
						<div className="rounded-lg border border-border bg-card px-4 py-3 shadow-warm">
							<p className="text-xs text-muted-foreground">Published</p>
							<p className="text-2xl font-bold text-chart-2">
								{publishedCount}
							</p>
						</div>
						<div className="rounded-lg border border-border bg-card px-4 py-3 shadow-warm">
							<p className="text-xs text-muted-foreground">Total Submissions</p>
							<p className="text-2xl font-bold text-primary">
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
					<div className="rounded-xl border border-dashed border-border py-16 text-center">
						<FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-lg text-muted-foreground">No forms yet.</p>
						<p className="mt-1 text-sm text-muted-foreground">
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
			className="hover-lift block rounded-xl border border-border bg-card shadow-warm"
		>
			<div className="flex items-center gap-4 p-5">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h3 className="truncate text-lg font-semibold text-foreground">
							{form.name}
						</h3>
						{form.published ? (
							<span className="shrink-0 rounded-full bg-chart-2/20 px-2 py-0.5 text-xs text-chart-2">
								Published
							</span>
						) : (
							<span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
								Draft
							</span>
						)}
					</div>
					{form.description && (
						<p className="mt-0.5 truncate text-sm text-muted-foreground">
							{form.description}
						</p>
					)}
					<div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
						<span>{form.fields.length} fields</span>
						<span className="flex items-center gap-1">
							<Inbox size={12} />
							{form.submissionCount} submissions
						</span>
					</div>
				</div>

				<div className="flex items-center gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={handleToggle}
						title={form.published ? "Unpublish" : "Publish"}
					>
						{form.published ? <Eye size={16} /> : <EyeOff size={16} />}
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={handleDelete}
						className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
						title="Delete"
					>
						<Trash2 size={16} />
					</Button>
				</div>
			</div>
		</Link>
	);
}

function CreateFormCard({
	onCreated,
	onCancel,
}: {
	onCreated: () => void;
	onCancel: () => void;
}) {
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
			className="mb-6 rounded-xl border border-primary/30 bg-card p-5 shadow-warm"
		>
			<h3 className="mb-4 text-lg font-semibold text-foreground">Create New Form</h3>
			<div className="space-y-3">
				<Input
					type="text"
					placeholder="Form name"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<Input
					type="text"
					placeholder="Description (optional)"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
			</div>
			<div className="mt-4 flex justify-end gap-2">
				<Button type="button" variant="outline" size="sm" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					type="submit"
					size="sm"
					disabled={loading || !name.trim()}
				>
					{loading ? "Creating..." : "Create"}
				</Button>
			</div>
		</form>
	);
}
