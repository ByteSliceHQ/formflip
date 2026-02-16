import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import nprogressCss from "nprogress/nprogress.css?url";
import { NavProgress } from "@/components/nav-progress";
import type { RouterContext } from "@/router";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "FormFlip - AI-Driven Form Submissions",
			},
		],
		links: [
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "stylesheet",
				href: nprogressCss,
			},
		],
	}),

	component: RootComponent,
});

function RootComponent() {
	return (
		<html lang="en" className="overscroll-none">
			<head>
				<HeadContent />
			</head>
			<body>
				<NavProgress />
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
