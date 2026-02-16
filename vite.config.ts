import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	ssr: {
		external: ["bun:sqlite"],
	},
	build: {
		rollupOptions: {
			external: ["bun:sqlite"],
		},
	},
	plugins: [
		devtools({
			injectSource: { enabled: false },
		}),
		nitro({ preset: "bun" }),
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
