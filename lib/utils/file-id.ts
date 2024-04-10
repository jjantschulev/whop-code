export function convertToStorageId(filepath: string) {
	return filepath.replaceAll("/", "___").replaceAll(".", "-_-");
}

export function parseFromStorageId(fileId: string) {
	return fileId.replaceAll("__", "/").replaceAll("-_-", ".");
}
