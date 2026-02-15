import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@/components/auth";
import { Button } from "@/components/ui/button";

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
		<div className="min-h-screen bg-dot-grid px-6 py-20">
			<div className="mx-auto max-w-5xl">
				<div className="mb-16 text-center">
					<h1 className="font-display mb-4 text-4xl font-semibold italic text-foreground md:text-5xl">
						Simple, transparent pricing
					</h1>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						Choose the plan that fits your needs. Upgrade or downgrade at any
						time.
					</p>
				</div>

				<div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
					{plans.map((plan) => (
						<div
							key={plan.name}
							className={`relative rounded-2xl border p-8 shadow-warm ${
								plan.highlighted
									? "border-primary bg-card"
									: "border-border bg-card"
							}`}
						>
							{plan.highlighted && (
								<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
									Most Popular
								</div>
							)}
							<h2 className="font-display mb-2 text-2xl font-semibold italic text-foreground">
								{plan.name}
							</h2>
							<p className="mb-6 text-sm text-muted-foreground">
								{plan.description}
							</p>
							<div className="mb-8">
								<span className="text-5xl font-bold text-foreground">
									${plan.price}
								</span>
								<span className="text-muted-foreground">/month</span>
							</div>
							<ul className="mb-8 space-y-3">
								{plan.features.map((feature) => (
									<li
										key={feature}
										className="flex items-center gap-3 text-foreground"
									>
										<Check
											size={18}
											className={
												plan.highlighted
													? "text-primary"
													: "text-muted-foreground"
											}
										/>
										{feature}
									</li>
								))}
							</ul>

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
