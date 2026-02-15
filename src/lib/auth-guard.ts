import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
	const request = getRequest();
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		throw redirect({ to: "/" });
	}
	return next({ context: { userId: session.user.id } });
});

export const authedFn = (opts: { method: "GET" | "POST" }) =>
	createServerFn(opts).middleware([authMiddleware]);
