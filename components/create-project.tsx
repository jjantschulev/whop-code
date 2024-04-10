"use client";

import { createBucket } from "@/lib/actions/create-bucket";
import { useMutation } from "@tanstack/react-query";
import { Button } from "frosted-ui";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreateProject({ experienceId }: { experienceId: string }) {
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: () => createBucket(experienceId),
		onSuccess: () => {
			router.refresh();
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	return (
		<Button loading={isPending} onClick={() => mutate()} variant="classic">
			Create Project
		</Button>
	);
}
