import { StandardError, WhopEnv, WhopEnvStore } from "@whop-apps/sdk";
import { cache } from "react";
import { convertToStorageId } from "../utils/file-id";

export const getFileContents = cache(async function getFileContents(
	experienceId: string,
	filepath: string,
) {
	const fileId = convertToStorageId(filepath);

	const rawFileResponse = await fetch(
		`https://storage.api.whop.com/api/v1/buckets/${experienceId}/files/${fileId}`,
		{
			headers: {
				Authorization: `Bearer ${WhopEnvStore.get(WhopEnv.API_KEY)}`,
			},
			// next: {
			// 	revalidate: 60 * 60 * 24,
			// 	tags: [params.experienceId],
			// },
		},
	);

	if (!rawFileResponse.ok) {
		const message = await rawFileResponse.text();
		throw new StandardError(500, `Failed to download file: ${filepath}. Message: ${message}`);
	}

	const rawFile = await rawFileResponse.text();
	return rawFile;
});
