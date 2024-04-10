"use client";

import { deleteFile as deleteFileServer } from "@/lib/actions/delete-file";
import { saveFile } from "@/lib/actions/save-file";
import { getLanguage, type FileData, type TextFile } from "@/lib/utils/text-file";
import { Result } from "@whop-apps/sdk";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type PropsWithChildren,
} from "react";
import { toast } from "sonner";

type ApplicationContext = {
	experienceId: string;
	files: TextFile[];
	activeFile: TextFile | null;
	setActiveFile(filepath: string): void;
	hasChanges: boolean;
	save(): Promise<void>;
	createFile(filepath: string): void;
	deleteFile(filepath: string): Promise<void>;
	setFileContent(filepath: string, content: string): void;
};

const ApplicationContext = createContext<ApplicationContext | null>(null);

export function ApplicationContextProvider({
	children,
	initialFiles,
	experienceId,
}: PropsWithChildren<{ experienceId: string; initialFiles: FileData[] }>) {
	const [files, setFiles] = useState<TextFile[]>(
		initialFiles.map((d) => ({
			...d,
			language: getLanguage(d.filepath),
			experienceId,
			hasChanges: false,
		})),
	);

	const [activeFilePath, setActiveFile] = useState<string | null>(null);

	const activeFile = files.find((f) => f.filepath === activeFilePath) ?? null;

	const createFile = useCallback(
		(filepath: string) => {
			setFiles((files) => {
				const exists = files.find((f) => f.filepath === filepath);
				if (exists) return files;
				const newFile: TextFile = {
					content: "",
					filepath,
					experienceId,
					hasChanges: true,
					language: getLanguage(filepath),
				};
				return [...files, newFile];
			});
		},
		[experienceId],
	);

	const setFileContent = useCallback((filepath: string, content: string) => {
		setFiles((files) => {
			const index = files.findIndex((f) => f.filepath === filepath);
			if (index < 0) return files;

			const newFiles = [...files];

			newFiles[index] = {
				...newFiles[index],
				content,
				hasChanges: true,
			};

			return newFiles;
		});
	}, []);

	const deleteFile = useCallback(
		async (filepath: string) => {
			const result = await deleteFileServer(experienceId, filepath);
			if (result.status === "error" && result.error.message !== "Not found") {
				toast.error(result.error.message);
				return;
			}
			setFiles((files) => files.filter((f) => f.filepath !== filepath));
		},
		[experienceId],
	);

	const save = useCallback(async () => {
		try {
			await Promise.all(
				files.map((f) =>
					saveFile(experienceId, f.filepath, f.content).then((d) => Result.from(d).unwrap()),
				),
			);
			setFiles((files) => files.map((f) => (f.hasChanges ? { ...f, hasChanges: false } : f)));

			toast.success("Saved project!");
		} catch (error) {
			toast.error((error as Error).message);
		}
	}, [experienceId, files]);

	const hasChanges = files.some((f) => f.hasChanges);

	const applicationContext = useMemo<ApplicationContext>(
		() => ({
			experienceId,
			files,
			createFile,
			hasChanges,
			activeFile,
			setActiveFile,
			setFileContent,
			deleteFile,
			save,
		}),
		[experienceId, files, createFile, hasChanges, activeFile, setFileContent, deleteFile, save],
	);

	return (
		<ApplicationContext.Provider value={applicationContext}>{children}</ApplicationContext.Provider>
	);
}

export function useApplication() {
	const value = useContext(ApplicationContext);
	if (!value) throw Error("ApplicationContext not defined");
	return value;
}
