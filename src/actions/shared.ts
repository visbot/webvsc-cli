// @ts-ignore
import { convertPreset } from '@visbot/webvsc';
import { basename } from "node:path";
import { readFile, stat } from 'node:fs/promises';

export type Options = {
	indent?: number,
	debug?: boolean,
	details?: boolean,
	quiet?: boolean,
	summary?: false
	watch?: boolean,
}

export const defaultOptions: Options = {
	indent: 2,
	debug: false,
	details: false,
	quiet: false,
	watch: false
}

export async function convertFile(avsFile: string, options: Options = defaultOptions) {
	const presetName = basename(avsFile, '.avs');
	const avsBuffer = await readFile(avsFile);
	const modifiedDate = ((await stat(avsFile)).mtime || new Date()).toISOString();

	try {
		return JSON.parse(avsBuffer.toString());
	} catch (error) {
		return convertPreset(avsBuffer, presetName, modifiedDate, options);
	}
}
