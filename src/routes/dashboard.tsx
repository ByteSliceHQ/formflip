import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import Header from "@/components/header";
import { auth } from "@/lib/auth";

const authGuard = createServerFn({ method: "GET" }).handler(async () => {
	const request = getRequest();
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		throw redirect({ to: "/" });
	}

	return { userId: session.user.id };
});

export const Route = createFileRoute("/dashboard")({
	beforeLoad: () => authGuard(),
	component: DashboardLayout,
});

function DashboardLayout() {
	return (
		<>
			<Header />
			<Outlet />
		</>
	);
}
