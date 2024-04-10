import { WhopAPI } from "@whop-apps/sdk";
import { cache } from "react";

export const getCompany = cache(async function getCompany(id: string) {
	return (
		await WhopAPI.app().GET("/app/companies/{id}", {
			params: { path: { id } },
			next: { revalidate: 600 },
		})
	).unwrap();
});
