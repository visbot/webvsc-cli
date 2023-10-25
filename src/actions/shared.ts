// @ts-ignore
import { convertPreset } from '@visbot/webvsc';
import { basename } from "node:path";
import { readFile, stat } from 'node:fs/promises';

export const defaultOptions = {
	indent: 2,
	debug: false,
	summary: false,
	watch: false
}

export async function convertFile(avsFile: string, options = defaultOptions) {
	const presetName = basename(avsFile, '.avs');
	const avsBuffer = await readFile(avsFile);
	const modifiedDate = ((await stat(avsFile)).mtime || new Date()).toISOString();

	try {
		return JSON.parse(avsBuffer.toString());
	} catch (error) {
		return convertPreset(avsBuffer, presetName, modifiedDate, options);
	}
}
