"use client";

import { useApplication } from "@/components/application-context";
import { cn } from "@/lib/utils/cn";
import type { TextFile } from "@/lib/utils/text-file";
import { Document16, Plus16, Trash12 } from "@frosted-ui/icons";
import { Editor, type EditorProps } from "@monaco-editor/react";
import { useMutation } from "@tanstack/react-query";
import {
	Button,
	DialogContent,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
	IconButton,
	Text,
	TextFieldInput,
	useThemeContext,
} from "frosted-ui";
import { useCallback, useEffect, useState } from "react";

const editorOptions: EditorProps["options"] = {
	minimap: { enabled: false },
	// theme:
	// theme: "vs-dark",
};

export default function ClientPage() {
	const { activeFile } = useApplication();
	return (
		<div className="relative flex h-full items-stretch gap-4 p-4 dark:bg-[#1E1E1E]">
			<FileList />
			<div className="flex h-full flex-1 items-center justify-center">
				{activeFile ? (
					<ActiveEditor />
				) : (
					<Text className="text-gray-a10">
						No files created yet. Please create a file to get started
					</Text>
				)}
			</div>
			<SaveButton />
		</div>
	);
}

function SaveButton() {
	const { save, hasChanges } = useApplication();

	const { isPending, mutate } = useMutation({
		mutationFn: save,
		onSuccess: () => {
			if (!("BroadcastChannel" in window)) return;
			const channel = new BroadcastChannel("whop-code-update");
			channel.postMessage("refresh");
		},
	});

	useEffect(() => {
		// add keyboard shortcut for save listeners to window
		const listener = (e: KeyboardEvent) => {
			if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				mutate();
			}
		};

		window.addEventListener("keydown", listener);
		return () => {
			window.removeEventListener("keydown", listener);
		};
	}, [mutate]);

	return (
		<div className={cn("absolute right-8 bottom-8 transition", { "translate-y-16": !hasChanges })}>
			<Button variant="classic" onClick={() => mutate()} color="success" loading={isPending}>
				<Document16 />
				Save
			</Button>
		</div>
	);
}

function ActiveEditor() {
	const { activeFile, setFileContent } = useApplication();
	if (!activeFile) throw Error("invalid usage of ActiveEditor");
	const { appearance } = useThemeContext();

	const onChange = useCallback(
		(value: string | undefined) => {
			setFileContent(activeFile.filepath, value ?? "");
		},
		[activeFile.filepath, setFileContent],
	);

	return (
		<Editor
			theme={appearance === "dark" ? "vs-dark" : "vs"}
			className="h-full"
			defaultLanguage={activeFile.language}
			defaultValue={activeFile.content}
			path={activeFile.filepath}
			options={editorOptions}
			onChange={onChange}
		/>
	);
}

function FileList() {
	const { files } = useApplication();

	return (
		<div className="flex h-full w-full max-w-64 flex-col gap-2">
			{files.map((f) => (
				<FileListItem key={f.filepath} file={f} />
			))}
			<NewFileModal />
		</div>
	);
}

function FileListItem({ file }: { file: TextFile }) {
	const { activeFile, setActiveFile } = useApplication();
	return (
		<button
			type="button"
			onClick={() => {
				setActiveFile(file.filepath);
			}}
			className={cn("flex items-center gap-3 rounded-md border border-gray-a4 px-3 py-1", {
				"border-gray-a6 bg-gray-a4": activeFile?.filepath === file.filepath,
			})}
		>
			<Document16
				className={cn({
					"text-warning": file.hasChanges,
				})}
			/>
			<span className="flex-1 truncate text-left">{file.filepath}</span>
			<DeleteIcon filepath={file.filepath} />
		</button>
	);
}

function DeleteIcon({ filepath }: { filepath: string }) {
	const { deleteFile } = useApplication();
	const { isPending, mutate } = useMutation({
		mutationFn: () => deleteFile(filepath),
	});

	return (
		<IconButton size="1" color="danger" variant="soft" loading={isPending} onClick={() => mutate()}>
			<Trash12 />
		</IconButton>
	);
}

function NewFileModal() {
	const [isOpen, setIsOpen] = useState(false);
	const { createFile } = useApplication();

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const filepath = formData.get("filepath");
		if (typeof filepath !== "string") return;
		createFile(filepath);
		setIsOpen(false);
	};

	return (
		<DialogRoot open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger>
				<Button className="w-full" variant="classic">
					<Plus16 />
					New File
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>Create File</DialogTitle>
				<form onSubmit={onSubmit} className="flex flex-col items-stretch gap-3">
					<TextFieldInput name="filepath" placeholder="path/to/file.js" />
					<div className="flex justify-end gap-3">
						<Button type="reset" onClick={() => setIsOpen(false)}>
							Cancel
						</Button>
						<Button variant="classic" type="submit">
							<Plus16 /> Create
						</Button>
					</div>
				</form>
			</DialogContent>
		</DialogRoot>
	);
}
