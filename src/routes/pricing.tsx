import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@/components/AuthComponents";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

function PricingPage() {
	const plans = [
		{
			name: "Starter",
			price: 5,
			description: "For individuals getting started with AI forms.",
			features: [
				"Up to 10 forms",
				"100 submissions/month",
				"Basic AI validation",
				"Email support",
			],
			cta: "Get Started",
			highlighted: false,
		},
		{
			name: "Pro",
			price: 25,
			description: "For teams that need advanced AI form capabilities.",
			features: [
				"Unlimited forms",
				"Unlimited submissions",
				"Advanced AI processing",
				"Priority support",
				"Custom integrations",
				"Analytics dashboard",
			],
			cta: "Go Pro",
			highlighted: true,
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 py-20">
			<div className="mx-auto max-w-5xl">
				<div className="mb-16 text-center">
					<h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
						Simple, transparent pricing
					</h1>
					<p className="mx-auto max-w-2xl text-lg text-gray-400">
						Choose the plan that fits your needs. Upgrade or downgrade at any
						time.
					</p>
				</div>

				<div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
					{plans.map((plan) => (
						<div
							key={plan.name}
							className={`relative rounded-2xl border p-8 ${
								plan.highlighted
									? "border-cyan-500 bg-slate-800/80 shadow-lg shadow-cyan-500/20"
									: "border-slate-700 bg-slate-800/50"
							}`}
						>
							{plan.highlighted && (
								<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-xs font-semibold text-white">
									Most Popular
								</div>
							)}
							<h2 className="mb-2 text-2xl font-bold text-white">
								{plan.name}
							</h2>
							<p className="mb-6 text-sm text-gray-400">{plan.description}</p>
							<div className="mb-8">
								<span className="text-5xl font-black text-white">
									${plan.price}
								</span>
								<span className="text-gray-400">/month</span>
							</div>
							<ul className="mb-8 space-y-3">
								{plan.features.map((feature) => (
									<li
										key={feature}
										className="flex items-center gap-3 text-gray-300"
									>
										<Check
											size={18}
											className={
												plan.highlighted ? "text-cyan-400" : "text-gray-500"
											}
										/>
										{feature}
									</li>
								))}
							</ul>

							{/* Pricing action - empty for now */}
							<SignedOut>
								<SignInButton>
									<Button
										type="button"
										variant={plan.highlighted ? "default" : "outline"}
										className="w-full"
									>
										{plan.cta}
									</Button>
								</SignInButton>
							</SignedOut>
							<SignedIn>
								<Button
									asChild
									variant={plan.highlighted ? "default" : "outline"}
									className="w-full"
								>
									<Link to="/dashboard">{plan.cta}</Link>
								</Button>
							</SignedIn>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
