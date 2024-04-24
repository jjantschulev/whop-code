"use server";

import { Err, Ok, StandardError, authorizedUserOn, hasAccess } from "@whop-apps/sdk";
import { StorageApi } from "@whop-apps/storage";
import { headers } from "next/headers";
import { getExperience } from "../data/get-experience";
import { convertToStorageId } from "../utils/file-id";

export async function deleteFile(experienceId: string, filepath: string) {
	try {
		const experience = await getExperience(experienceId);

		if (!(await hasAccess({ to: authorizedUserOn(experience.company_id), headers }))) {
			throw new StandardError(401, "Permission denied, not an admin of the company.");
		}

		const api = StorageApi({ mode: "server" });

		const fileId = convertToStorageId(filepath);

		await api.deleteFile(experienceId, fileId);

		return Ok("ok").toJSON();
	} catch (err) {
		return Err(StandardError.from(err, { fromAny: true }).toJSON()).toJSON();
	}
}
