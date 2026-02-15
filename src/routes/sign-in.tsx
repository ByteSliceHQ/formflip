import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";
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
						<div>
							<label
								htmlFor="email"
								className="mb-1 block text-sm font-medium text-gray-300"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
								placeholder="you@example.com"
							/>
						</div>
						<div>
							<label
								htmlFor="password"
								className="mb-1 block text-sm font-medium text-gray-300"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
								placeholder="Your password"
							/>
						</div>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="mt-6 w-full rounded-lg bg-cyan-500 py-2.5 font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
					>
						{loading ? "Signing in..." : "Sign In"}
					</button>
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
