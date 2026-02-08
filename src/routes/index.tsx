import { Link, createFileRoute } from "@tanstack/react-router";
import {
	SignedIn,
	SignedOut,
	SignInButton,
} from "@/components/AuthComponents";
import {
	ArrowRight,
	Bot,
	FileText,
	LayoutDashboard,
	Settings,
	Sparkles,
	Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
	const features = [
		{
			icon: <Bot className="h-10 w-10 text-cyan-400" />,
			title: "AI-Powered Forms",
			description:
				"Intelligent form submissions that understand context and adapt to user behavior in real time.",
		},
		{
			icon: <Zap className="h-10 w-10 text-cyan-400" />,
			title: "Instant Processing",
			description:
				"Submissions are validated, enriched, and routed by AI the moment they arrive.",
		},
		{
			icon: <Settings className="h-10 w-10 text-cyan-400" />,
			title: "Configurable Fields",
			description:
				"Build forms with custom input types, required fields, and flexible ordering from your dashboard.",
		},
		{
			icon: <LayoutDashboard className="h-10 w-10 text-cyan-400" />,
			title: "Dashboard Management",
			description:
				"Create, edit, and manage all your forms from a single intuitive dashboard.",
		},
		{
			icon: <FileText className="h-10 w-10 text-cyan-400" />,
			title: "Submission Tracking",
			description:
				"Keep track of every form submission with detailed analytics and AI-generated insights.",
		},
		{
			icon: <Sparkles className="h-10 w-10 text-cyan-400" />,
			title: "Smart Validation",
			description:
				"AI-driven validation that goes beyond type checking to understand the intent behind every input.",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			{/* Hero */}
			<section className="relative overflow-hidden px-6 py-24 text-center">
				<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
				<div className="relative mx-auto max-w-4xl">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-300">
						🌀 Powered by SWIRLS_
					</div>
					<h1 className="mb-6 text-5xl font-black tracking-tight text-white md:text-7xl">
						Build smarter forms with{" "}
						<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
							FormFlip
						</span>
					</h1>
					<p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
						Create intelligent forms that adapt, validate, and process
						submissions using AI. Configure fields, set requirements, and manage
						everything from your dashboard.
					</p>
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<SignedOut>
							<SignInButton>
								<button
									type="button"
									className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-cyan-500/30 transition-colors hover:bg-cyan-600"
								>
									Get Started Free
									<ArrowRight size={20} />
								</button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<Link
								to="/dashboard"
								className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-cyan-500/30 transition-colors hover:bg-cyan-600"
							>
								Go to Dashboard
								<ArrowRight size={20} />
							</Link>
						</SignedIn>
						<Link
							to="/pricing"
							className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-8 py-3 text-lg font-semibold text-gray-300 transition-colors hover:border-slate-500 hover:text-white"
						>
							View Pricing
						</Link>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="mx-auto max-w-7xl px-6 py-20">
				<div className="mb-16 text-center">
					<h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
						Everything you need for intelligent forms
					</h2>
					<p className="mx-auto max-w-2xl text-gray-400">
						FormFlip combines powerful form building tools with AI to deliver a
						seamless experience from creation to submission.
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
						Start building AI-powered forms today. No credit card required.
					</p>
					<SignedOut>
						<SignInButton>
							<button
								type="button"
								className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-cyan-500/30 transition-colors hover:bg-cyan-600"
							>
								Get Started Free
								<ArrowRight size={20} />
							</button>
						</SignInButton>
					</SignedOut>
					<SignedIn>
						<Link
							to="/dashboard"
							className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-cyan-500/30 transition-colors hover:bg-cyan-600"
						>
							Go to Dashboard
							<ArrowRight size={20} />
						</Link>
					</SignedIn>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-slate-800 px-6 py-8">
				<div className="mx-auto flex max-w-7xl items-center justify-between">
					<div className="flex items-center gap-2 text-gray-500">
						<span>🌀</span>
						<span className="text-sm">Powered by SWIRLS_</span>
					</div>
					<p className="text-sm text-gray-500">
						&copy; {new Date().getFullYear()} FormFlip. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
