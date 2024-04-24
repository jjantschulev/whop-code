"use server";

import {
	Err,
	Ok,
	StandardError,
	authorizedUserOn,
	hasAccess,
	makeAccessString,
} from "@whop-apps/sdk";
import { StorageApi } from "@whop-apps/storage";
import { headers } from "next/headers";
import { getExperience } from "../data/get-experience";
import { saveFile } from "./save-file";

export async function createBucket(experienceId: string) {
	try {
		const experience = await getExperience(experienceId);

		if (!(await hasAccess({ to: authorizedUserOn(experience.company_id), headers }))) {
			throw new StandardError(401, "Permission denied, not an admin of the company.");
		}

		const bucket = await StorageApi({ mode: "server" }).createBucket({
			bucket_id: experienceId,
			view_access: experienceId,
			delete_access: makeAccessString(authorizedUserOn(experience.company_id)),
			upload_access: makeAccessString(authorizedUserOn(experience.company_id)),
		});

		await saveFile(experience.id, "index.html", INITIAL_HTML_DOC);

		return Ok(bucket).toJSON();
	} catch (err) {
		return Err(StandardError.from(err, { fromAny: true }).toJSON()).toJSON();
	}
}

const INITIAL_HTML_DOC = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
</head>
<body>
	
</body>
</html>
`;
