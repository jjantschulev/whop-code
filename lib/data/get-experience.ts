import { WhopAPI } from "@whop-apps/sdk";
import { cache } from "react";

export const getExperience = cache(async function getExperience(id: string) {
	return (
		await WhopAPI.app().GET("/app/experiences/{id}", {
			params: { path: { id } },
			next: { revalidate: 600 },
		})
	).unwrap();
});
