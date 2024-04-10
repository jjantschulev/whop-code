import { StorageApi } from "@whop-apps/storage";
import { cache } from "react";

export const getBucket = cache(async function getBucket(experienceId: string) {
	const api = StorageApi({ mode: "server" });
	const bucket = await api.getBucket(experienceId).catch(() => null);
	return bucket;
});
