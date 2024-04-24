import { ApplicationContextProvider } from "@/components/application-context";
import { CreateProject } from "@/components/create-project";
import { getBucket } from "@/lib/data/get-bucket";
import { getBucketFiles } from "@/lib/data/get-bucket-files";
import { getExperience } from "@/lib/data/get-experience";
import { authorizedUserOn, hasAccess } from "@whop-apps/sdk";
import ClientPage from "./page.client";

export default async function Home({ params }: { params: { experienceId: string } }) {
	const experience = await getExperience(params.experienceId);
	const bucket = await getBucket(params.experienceId);

	if (!(await hasAccess({ to: authorizedUserOn(experience.company_id) })))
		return <div>not an admin</div>;

	if (!bucket) {
		return (
			<div className="flex h-[100dvh] items-center justify-center">
				<CreateProject experienceId={params.experienceId} />
			</div>
		);
	}

	const files = await getBucketFiles(params.experienceId);

	return (
		<div className="h-screen overflow-hidden">
			<ApplicationContextProvider experienceId={params.experienceId} initialFiles={files}>
				<ClientPage />
			</ApplicationContextProvider>
		</div>
	);
}
