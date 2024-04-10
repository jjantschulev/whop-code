import { getCompany } from "@/lib/data/get-company";
import { getExperience } from "@/lib/data/get-experience";
import { getFileContents } from "@/lib/data/get-file-contents";
import { getUser } from "@/lib/data/get-user";
import { getMimetype } from "@/lib/utils/text-file";
import { Err, StandardError, hasAccess } from "@whop-apps/sdk";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
	req: NextRequest,
	{ params }: { params: { catchAll?: string[]; experienceId: string } },
): Promise<Response> {
	try {
		// check access;
		if (!(await hasAccess({ to: params.experienceId, headers }))) {
			return new StandardError(401, "Access to experience denied").toResponse();
		}

		// 0. prefetch ssr data
		const ssrData = fetchData(req, params);

		// 1. resolve the file path.
		const { fileId, fileName } = resolvePath(params.catchAll ?? []);

		// 2. get the file contents
		const rawFile = await getFileContents(params.experienceId, fileId);

		// 3. Inject SSR Data
		const renderedFile = interpolateVariables(rawFile, await ssrData);

		return new Response(renderedFile, {
			headers: {
				"Content-Type": getMimetype(fileName),
			},
		});
	} catch (err) {
		return Err(StandardError.from(err, { fromAny: true }).toJSON()).toResponse();
	}
}

// transform a `/` back to `__`
function resolvePath(catchAll: string[]) {
	const parts = [...catchAll];
	const lastItemIsFile = parts.at(parts.length - 1)?.includes(".");
	if (!lastItemIsFile) parts.push("index.html");
	const fileName = parts[parts.length - 1];
	const fileId = parts.join("__");
	return { fileName, fileId };
}

function interpolateVariables(file: string, data: SsrData) {
	const lookup = {
		"{USER.ID}": data.user?.id ?? "",
		"{USER.NAME}": data.user?.name ?? "",
		"{USER.USERNAME}": data.user?.username ?? "",
		"{USER.PROFILE_PIC_URL}": data.user?.profile_pic_url ?? "",
		"{USER.EMAIL}": data.user?.email ?? "",

		"{EXPERIENCE.ID}": data.experience.id,
		"{EXPERIENCE.NAME}": data.experience.name,
		"{EXPERIENCE.COMPANY_ID}": data.experience.company_id,

		"{COMPANY.ID}": data.company.id,
		"{COMPANY.TITLE}": data.company.title,
		"{COMPANY.IMAGE_URL}": data.company.image_url ?? "",
		"{COMPANY.IS_AUTHORIZED_USER}": data.company.authorized_user ? "true" : "false",
		"{COMPANY.ROUTE}": data.company.route ?? "",
	} satisfies Record<string, string>;

	let output = file;
	for (const [key, value] of Object.entries(lookup)) {
		output = output.replaceAll(key, value);
	}
	return output;
}

type SsrData = Awaited<ReturnType<typeof fetchData>>;

async function fetchData(req: NextRequest, params: { experienceId: string }) {
	const [user, experience] = await Promise.all([getUser(req), getExperience(params.experienceId)]);
	const company = await getCompany(experience.company_id);
	return { user, experience, company };
}
