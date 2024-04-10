"use server";

import {
	Err,
	Ok,
	StandardError,
	WhopEnv,
	WhopEnvStore,
	authorizedUserOn,
	hasAccess,
} from "@whop-apps/sdk";
import { StorageApi } from "@whop-apps/storage";
import { headers } from "next/headers";
import { getExperience } from "../data/get-experience";
import { convertToStorageId } from "../utils/file-id";

export async function saveFile(experienceId: string, filepath: string, content: string) {
	try {
		const experience = await getExperience(experienceId);

		if (!hasAccess({ to: authorizedUserOn(experience.company_id), headers })) {
			throw new StandardError(401, "Permission denied, not an admin of the company.");
		}

		const api = StorageApi({ mode: "server" });

		const fileId = convertToStorageId(filepath);

		await api.deleteFile(experienceId, fileId).catch(() => null);

		const url = new URL(`https://storage.api.whop.com/api/v1/buckets/${experienceId}/upload`);
		url.searchParams.set("id", fileId);
		const res = await fetch(url, {
			method: "PUT",
			body: content,
			headers: {
				"Content-Type": "text/plain",
				Authorization: `Bearer ${WhopEnvStore.get(WhopEnv.API_KEY)}`,
			},
		});
		if (!res.ok) {
			const text = await res.text();
			throw new StandardError(res.status, text);
		}
		const data = await res.json();

		return Ok(
			data as NonNullable<
				Awaited<ReturnType<typeof api.PUT<"/buckets/{bucket_id}/upload">>>["data"]
			>,
		).toJSON();
	} catch (err) {
		return Err(StandardError.from(err, { fromAny: true }).toJSON()).toJSON();
	}
}
