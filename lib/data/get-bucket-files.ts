import { StorageApi } from "@whop-apps/storage";
import { cache } from "react";
import { parseFromStorageId } from "../utils/file-id";
import type { FileData } from "../utils/text-file";
import { getFileContents } from "./get-file-contents";

export const getBucketFiles = cache(async function getBucketFiles(experienceId: string) {
	const api = StorageApi({ mode: "server" });

	const files = await api.listFiles(experienceId);

	const fileData = await Promise.all(
		files.items.map<Promise<FileData>>(async (item) => ({
			content: await getFileContents(experienceId, item.file_id),
			filepath: parseFromStorageId(item.file_id),
		})),
	);

	return fileData;
});
