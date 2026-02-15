import { useRouterState } from "@tanstack/react-router";
import NProgress from "nprogress";
import { useEffect } from "react";

export function NavProgress() {
	const routerState = useRouterState();
	const navigating = routerState.status === "pending";

	useEffect(() => {
		NProgress.configure({
			showSpinner: false,
			trickleSpeed: 200,
			minimum: 0.1,
		});
	}, []);

	useEffect(() => {
		if (navigating) {
			NProgress.start();
		} else {
			NProgress.done();
		}
	}, [navigating]);

	return null;
}
