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
import { motion } from "motion/react";
import { SignedIn, SignedOut, SignInButton } from "@/components/auth";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: LandingPage });

const features = [
	{
		icon: FileText,
		title: "Visual Form Builder",
		description:
			"Create forms with custom fields — text, email, numbers, textareas, checkboxes, and dropdowns. Order and configure them from your dashboard.",
	},
	{
		icon: Globe,
		title: "Shareable Links",
		description:
			"Publish any form and get a unique link to share. Anyone can fill it out — no sign-up required for respondents.",
	},
	{
		icon: Inbox,
		title: "Submission Tracking",
		description:
			"Every response is captured and organized. View, expand, and manage submissions from a clean detail view.",
	},
	{
		icon: Zap,
		title: "Instant Publishing",
		description:
			"Toggle forms between draft and published in one click. Control when your forms accept responses.",
	},
	{
		icon: LayoutDashboard,
		title: "Dashboard Analytics",
		description:
			"See form counts, published status, and submission totals at a glance. Stay on top of every response.",
	},
	{
		icon: Settings,
		title: "Field Validation",
		description:
			"Mark fields as required so you always get the data you need. Server-side validation ensures data integrity.",
	},
];

function LandingPage() {
	return (
		<div className="min-h-screen bg-dot-grid">
			<Header />
			{/* Hero */}
			<section className="relative overflow-hidden px-6 py-24">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,oklch(0.52_0.175_25/0.08),transparent)]" />
				<div className="relative mx-auto max-w-4xl text-center">
					<motion.h1
						className="font-display mb-6 text-5xl font-semibold italic tracking-tight text-foreground md:text-7xl"
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						Build forms, share links,{" "}
						<span className="text-primary">collect responses</span>
					</motion.h1>
					<motion.p
						className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.15 }}
					>
						Create custom forms in seconds, publish them with a shareable link,
						and track every submission from your dashboard.
					</motion.p>
					<motion.div
						className="flex flex-col items-center justify-center gap-4 sm:flex-row"
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.3 }}
					>
						<SignedOut>
							<SignInButton>
								<Button size="lg" className="gap-2">
									Get Started Free
									<ArrowRight size={20} />
								</Button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<Button asChild size="lg" className="gap-2">
								<Link to="/dashboard">
									Go to Dashboard
									<ArrowRight size={20} />
								</Link>
							</Button>
						</SignedIn>
						<Button asChild variant="outline" size="lg" className="gap-2">
							<Link to="/pricing">View Pricing</Link>
						</Button>
					</motion.div>
				</div>
			</section>

			{/* Features */}
			<section className="mx-auto max-w-7xl px-6 py-20">
				<motion.div
					className="mb-16 text-center"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.4 }}
				>
					<h2 className="font-display mb-4 text-3xl font-semibold italic text-foreground md:text-4xl">
						Everything you need for form collection
					</h2>
					<p className="mx-auto max-w-2xl text-muted-foreground">
						FormFlip gives you the tools to build, share, and manage forms
						without the complexity.
					</p>
				</motion.div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature, i) => {
						const Icon = feature.icon;
						return (
							<motion.div
								key={feature.title}
								className="hover-lift rounded-xl border border-border bg-card p-6 shadow-warm"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-40px" }}
								transition={{ duration: 0.35, delay: i * 0.06 }}
							>
								<div className="mb-4">
									<Icon className="h-10 w-10 text-primary" />
								</div>
								<h3 className="font-display mb-3 text-xl font-semibold italic text-card-foreground">
									{feature.title}
								</h3>
								<p className="leading-relaxed text-muted-foreground">
									{feature.description}
								</p>
							</motion.div>
						);
					})}
				</div>
			</section>

			{/* CTA */}
			<section className="px-6 py-20">
				<motion.div
					className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-12 text-center shadow-warm"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
				>
					<h2 className="font-display mb-4 text-3xl font-semibold italic text-foreground">
						Ready to flip your forms?
					</h2>
					<p className="mb-8 text-muted-foreground">
						Start building and sharing forms today. No credit card required.
					</p>
					<SignedOut>
						<SignInButton>
							<Button size="lg" className="gap-2">
								Get Started Free
								<ArrowRight size={20} />
							</Button>
						</SignInButton>
					</SignedOut>
					<SignedIn>
						<Button asChild size="lg" className="gap-2">
							<Link to="/dashboard">
								Go to Dashboard
								<ArrowRight size={20} />
							</Link>
						</Button>
					</SignedIn>
				</motion.div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border px-6 py-8">
				<div className="mx-auto flex max-w-7xl items-center justify-between">
					<span className="font-display text-sm italic text-muted-foreground">
						FormFlip
					</span>
					<p className="text-sm text-muted-foreground">
						&copy; {new Date().getFullYear()} FormFlip. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
