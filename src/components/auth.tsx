import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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
		<NavigationMenu viewport={false} className="justify-end">
			<NavigationMenuList className="gap-0">
				<NavigationMenuItem>
					<NavigationMenuTrigger
						className="h-8 w-8 rounded-full p-0 [&>svg:last-child]:hidden"
						aria-label="User menu"
					>
						<Avatar>
							<AvatarImage
								src={session.user.image ?? undefined}
								alt={session.user.name ?? ""}
							/>
							<AvatarFallback>
								{session.user.name?.[0]?.toUpperCase() ?? <User size={16} />}
							</AvatarFallback>
						</Avatar>
					</NavigationMenuTrigger>
					<NavigationMenuContent className="right-0 left-auto min-w-48 py-1">
						<div className="border-b border-border px-4 py-2">
							<p className="text-sm font-medium text-popover-foreground">
								{session.user.name}
							</p>
							<p className="text-xs text-muted-foreground">
								{session.user.email}
							</p>
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
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
