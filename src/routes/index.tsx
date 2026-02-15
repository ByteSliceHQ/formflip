import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	FileText,
	Globe,
	Inbox,
	LayoutDashboard,
	Settings,
	Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@/components/AuthComponents";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
	const features = [
		{
			icon: <FileText className="h-10 w-10 text-cyan-400" />,
			title: "Visual Form Builder",
			description:
				"Create forms with custom fields — text, email, numbers, textareas, checkboxes, and dropdowns. Order and configure them from your dashboard.",
		},
		{
			icon: <Globe className="h-10 w-10 text-cyan-400" />,
			title: "Shareable Links",
			description:
				"Publish any form and get a unique link to share. Anyone can fill it out — no sign-up required for respondents.",
		},
		{
			icon: <Inbox className="h-10 w-10 text-cyan-400" />,
			title: "Submission Tracking",
			description:
				"Every response is captured and organized. View, expand, and manage submissions from a clean detail view.",
		},
		{
			icon: <Zap className="h-10 w-10 text-cyan-400" />,
			title: "Instant Publishing",
			description:
				"Toggle forms between draft and published in one click. Control when your forms accept responses.",
		},
		{
			icon: <LayoutDashboard className="h-10 w-10 text-cyan-400" />,
			title: "Dashboard Analytics",
			description:
				"See form counts, published status, and submission totals at a glance. Stay on top of every response.",
		},
		{
			icon: <Settings className="h-10 w-10 text-cyan-400" />,
			title: "Field Validation",
			description:
				"Mark fields as required so you always get the data you need. Server-side validation ensures data integrity.",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			{/* Hero */}
			<section className="relative overflow-hidden px-6 py-24 text-center">
				<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
				<div className="relative mx-auto max-w-4xl">
					<h1 className="mb-6 text-5xl font-black tracking-tight text-white md:text-7xl">
						Build forms, share links,{" "}
						<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
							collect responses
						</span>
					</h1>
					<p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
						Create custom forms in seconds, publish them with a shareable link,
						and track every submission from your dashboard.
					</p>
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<SignedOut>
							<SignInButton>
								<Button size="lg" className="gap-2 shadow-lg shadow-cyan-500/30">
									Get Started Free
									<ArrowRight size={20} />
								</Button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<Button asChild size="lg" className="gap-2 shadow-lg shadow-cyan-500/30">
								<Link to="/dashboard">
									Go to Dashboard
									<ArrowRight size={20} />
								</Link>
							</Button>
						</SignedIn>
						<Button asChild variant="outline" size="lg" className="gap-2">
							<Link to="/pricing">View Pricing</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="mx-auto max-w-7xl px-6 py-20">
				<div className="mb-16 text-center">
					<h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
						Everything you need for form collection
					</h2>
					<p className="mx-auto max-w-2xl text-gray-400">
						FormFlip gives you the tools to build, share, and manage forms
						without the complexity.
					</p>
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<div
							key={feature.title}
							className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
						>
							<div className="mb-4">{feature.icon}</div>
							<h3 className="mb-3 text-xl font-semibold text-white">
								{feature.title}
							</h3>
							<p className="leading-relaxed text-gray-400">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* CTA */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-3xl rounded-2xl border border-slate-700 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-12 text-center">
					<h2 className="mb-4 text-3xl font-bold text-white">
						Ready to flip your forms?
					</h2>
					<p className="mb-8 text-gray-400">
						Start building and sharing forms today. No credit card required.
					</p>
					<SignedOut>
						<SignInButton>
							<Button size="lg" className="gap-2 shadow-lg shadow-cyan-500/30">
								Get Started Free
								<ArrowRight size={20} />
							</Button>
						</SignInButton>
					</SignedOut>
					<SignedIn>
						<Button asChild size="lg" className="gap-2 shadow-lg shadow-cyan-500/30">
							<Link to="/dashboard">
								Go to Dashboard
								<ArrowRight size={20} />
							</Link>
						</Button>
					</SignedIn>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-slate-800 px-6 py-8">
				<div className="mx-auto flex max-w-7xl items-center justify-between">
					<span className="text-sm text-gray-500">FormFlip</span>
					<p className="text-sm text-gray-500">
						&copy; {new Date().getFullYear()} FormFlip. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
