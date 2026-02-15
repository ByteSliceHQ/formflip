import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/sign-in")({
	component: SignInPage,
});

function SignInPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const { error } = await authClient.signIn.email({
			email,
			password,
		});

		setLoading(false);
		if (error) {
			setError(error.message ?? "Sign in failed");
		} else {
			navigate({ to: "/dashboard" });
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<div className="mb-4 inline-flex items-center gap-2 text-cyan-400">
						<Sparkles className="h-8 w-8" />
					</div>
					<h1 className="text-3xl font-bold text-white">Welcome back</h1>
					<p className="mt-2 text-gray-400">Sign in to your FormFlip account</p>
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
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-gray-300">
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
							<Label htmlFor="password" className="text-gray-300">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								placeholder="Your password"
							/>
						</div>
					</div>
					<Button type="submit" disabled={loading} className="mt-6 w-full">
						{loading ? "Signing in..." : "Sign In"}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-gray-400">
					Don't have an account?{" "}
					<Link
						to="/sign-up"
						className="font-medium text-cyan-400 hover:text-cyan-300"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
