import { Swirls } from "@swirls/sdk/client";
import { env } from "@/env";

export const swirls = new Swirls({
	apiKey: env.SWIRLS_API_KEY,
});
