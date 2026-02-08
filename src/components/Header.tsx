import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Tag } from "lucide-react";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "./AuthComponents";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
				<Link to="/" className="flex items-center gap-2">
					<span className="text-2xl">🐦</span>
					<span className="text-xl font-bold text-white">FormFlip</span>
				</Link>

				<nav className="flex items-center gap-6">
					<Link
						to="/pricing"
						className="flex items-center gap-1.5 text-sm text-gray-300 transition-colors hover:text-white [&.active]:text-cyan-400"
					>
						<Tag size={16} />
						Pricing
					</Link>

					<SignedIn>
						<Link
							to="/dashboard"
							className="flex items-center gap-1.5 text-sm text-gray-300 transition-colors hover:text-white [&.active]:text-cyan-400"
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
