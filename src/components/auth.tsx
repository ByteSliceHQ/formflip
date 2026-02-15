import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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
				<Button type="button" size="sm">
					Sign In
				</Button>
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
			<Button
				type="button"
				size="icon"
				className="h-8 w-8 rounded-full"
			>
				{session.user.name?.[0]?.toUpperCase() ?? (
					<User size={16} />
				)}
			</Button>
			<div className="invisible absolute right-0 top-full z-50 mt-2 min-w-48 rounded-lg border border-border bg-popover py-1 shadow-warm group-hover:visible">
				<div className="border-b border-border px-4 py-2">
					<p className="text-sm font-medium text-popover-foreground">
						{session.user.name}
					</p>
					<p className="text-xs text-muted-foreground">{session.user.email}</p>
				</div>
				<Button
					type="button"
					variant="ghost"
					onClick={handleSignOut}
					className="flex w-full items-center justify-start gap-2 px-4 py-2 text-sm"
				>
					<LogOut size={14} />
					Sign Out
				</Button>
			</div>
		</div>
	);
}
