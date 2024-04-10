import { WhopAPI, validateToken } from "@whop-apps/sdk";
import type { NextRequest } from "next/server";
import { cache } from "react";

export const getUser = cache(async function getUser(req: NextRequest) {
	const token = await validateToken({ req, dontThrow: true });
	if (!token) return null;
	const user = (
		await WhopAPI.app().GET("/app/users/{id}", {
			params: { path: { id: token.userId } },
			next: { revalidate: 300 },
		})
	).or(null);
	return user;
});
