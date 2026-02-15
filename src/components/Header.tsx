import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Tag } from "lucide-react";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@/components/auth";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/95">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
				<Link
					to="/"
					className="font-display text-xl font-semibold italic text-foreground transition-opacity hover:opacity-80"
				>
					<span className="text-primary">F</span>ormFlip
				</Link>

				<nav className="flex items-center gap-6">
					<Link
						to="/pricing"
						className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary"
					>
						<Tag size={16} />
						Pricing
					</Link>

					<SignedIn>
						<Link
							to="/dashboard"
							className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary"
						>
							<LayoutDashboard size={16} />
							Dashboard
						</Link>
						<UserButton />
					</SignedIn>

					<SignedOut>
						<SignInButton />
					</SignedOut>
				</nav>
			</div>
		</header>
	);
}
