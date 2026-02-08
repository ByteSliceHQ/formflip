import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function SignedIn({ children }: { children: React.ReactNode }) {
	const { data: session } = authClient.useSession();
	if (!session?.user) return null;
	return <>{children}</>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = authClient.useSession();
	if (isPending) return null;
	if (session?.user) return null;
	return <>{children}</>;
}

export function SignInButton({ children }: { children?: React.ReactNode }) {
	return (
		<Link to="/sign-in">
			{children ?? (
				<button
					type="button"
					className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
				>
					Sign In
				</button>
			)}
		</Link>
	);
}

export function UserButton() {
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	if (!session?.user) return null;

	const handleSignOut = async () => {
		await authClient.signOut();
		navigate({ to: "/" });
	};

	return (
		<div className="group relative">
			<button
				type="button"
				className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-sm font-medium text-white"
			>
				{session.user.name?.[0]?.toUpperCase() ?? (
					<User size={16} />
				)}
			</button>
			<div className="invisible absolute right-0 top-full z-50 mt-2 min-w-48 rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl group-hover:visible">
				<div className="border-b border-slate-700 px-4 py-2">
					<p className="text-sm font-medium text-white">
						{session.user.name}
					</p>
					<p className="text-xs text-gray-400">{session.user.email}</p>
				</div>
				<button
					type="button"
					onClick={handleSignOut}
					className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-slate-700 hover:text-white"
				>
					<LogOut size={14} />
					Sign Out
				</button>
			</div>
		</div>
	);
}
