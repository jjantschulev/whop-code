export type Language = "javascript" | "css" | "html" | "plain" | "json";

export interface FileData {
	filepath: string;
	content: string;
}

export interface TextFile extends FileData {
	experienceId: string;
	language: Language;
	hasChanges: boolean;
}

export function getLanguage(filepath: string): Language {
	const extension = filepath.split(".").pop();
	switch (extension) {
		case "js":
		case "mjs":
			return "javascript";
		case "html":
			return "html";
		case "css":
			return "css";
		case "json":
			return "json";
		default:
			return "plain";
	}
}

export function getMimetype(filepath: string) {
	const language = getLanguage(filepath);
	switch (language) {
		case "json":
			return "application/json";
		default:
			return `text/${language}`;
	}
}
