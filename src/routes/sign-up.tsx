import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/sign-up")({
	component: SignUpPage,
});

function SignUpPage() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const { error } = await authClient.signUp.email({
			name,
			email,
			password,
		});

		setLoading(false);
		if (error) {
			setError(error.message ?? "Sign up failed");
		} else {
			navigate({ to: "/dashboard" });
		}
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-dot-grid px-6">
			<p
				className="font-display pointer-events-none absolute inset-0 flex items-center justify-center text-[clamp(6rem,18vw,14rem)] font-semibold italic text-foreground/5 select-none"
				aria-hidden
			>
				FormFlip
			</p>
			<div className="relative w-full max-w-md">
				<div className="mb-8 text-center">
					<div className="mb-4 inline-flex items-center gap-2 text-primary">
						<Sparkles className="h-8 w-8" />
					</div>
					<h1 className="font-display text-3xl font-semibold italic text-foreground">
						Create an account
					</h1>
					<p className="mt-2 text-muted-foreground">
						Get started with FormFlip for free
					</p>
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
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name" className="text-foreground">
								Name
							</Label>
							<Input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								placeholder="Your name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email" className="text-foreground">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								placeholder="you@example.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password" className="text-foreground">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={8}
								placeholder="Min. 8 characters"
							/>
						</div>
					</div>
					<Button type="submit" disabled={loading} className="mt-6 w-full">
						{loading ? "Creating account..." : "Create Account"}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link
						to="/sign-in"
						className="font-medium text-primary transition-colors hover:opacity-80"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
