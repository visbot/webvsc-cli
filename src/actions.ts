import { basename, dirname, resolve } from 'node:path';
import { convertPreset } from '@visbot/webvsc';
import { promises as fs } from 'node:fs';
import * as Utils from './utils';
import colors from 'picocolors';
import logSymbols from 'log-symbols';
import prettyBytes from 'pretty-bytes';

const defaultOptions = {
	indent: 2,
	debug: false
}

async function convertFile(avsFile: string, options = defaultOptions) {
	const presetName = basename(avsFile, '.avs');
	const avsBuffer = await fs.readFile(avsFile);
	const modifiedDate = ((await fs.stat(avsFile)).mtime || new Date()).toISOString();

	return convertPreset(avsBuffer, presetName, modifiedDate, options);
}

export async function convert(inputFiles, options = defaultOptions) {
	console.log(/* let it breathe */);
	console.time('✨ Completed');

	for (const avsFile of inputFiles.sort()) {
		const presetName = basename(avsFile, '.avs');
		const dirName = dirname(avsFile);
		const outputFile = resolve(dirName, `${presetName}.webvs`);

		try {
			const webvs = await convertFile(avsFile, options);
			await fs.writeFile(outputFile, JSON.stringify(webvs, null, options.indent), 'utf-8');
			console.log(logSymbols.success, `Converted ${colors.cyan(avsFile)}`);
		} catch (err) {
			console.error(logSymbols.error, `Converted ${colors.cyan(avsFile)}`);

			if (options.debug) {
				console.log(/* let it breathe */);
				console.error(err instanceof Error ? colors.red(err.message) : colors.red(err));
			}

			continue;
		}
	}

	console.log(/* let it breathe */);
	console.timeEnd('✨ Completed');
}

export async function info(inputFiles, options = defaultOptions) {
	for (const avsFile of inputFiles.sort()) {
		let webvs;

		try {
			webvs = await convertFile(avsFile, options);
		} catch (err) {
			if (options.debug) {
				console.log(/* let it breathe */);
				console.error(colors.green(avsFile));
				console.log(/* let it breathe */);
				console.error(err instanceof Error ? colors.red(err.message) : colors.red(err));

				if (inputFiles.length > 1) {
					console.log(/* let it breathe */);
					console.log('─'.repeat(80))
				}
			}

			continue;
		}

		const stat = await fs.stat(avsFile);
		const effects = Utils.separateEffects(webvs.components);
		const assets = Utils.getImageAssets(webvs.components);
		const fonts = Utils.getFontAssets(webvs.components);

		console.log(/* let it breathe */);
		console.log(`File: ${colors.green(avsFile)}`);
		console.log(/* let it breathe */);

		console.log(`Size: ${colors.blue(prettyBytes(stat.size))}`);
		console.log(`Modified: ${colors.blue(new Date(stat.mtime).toUTCString())}`);
		console.log(`SHA-256: ${colors.blue(await Utils.hashFile(avsFile))}`);

		Utils.printSummary('Effects', effects.builtin);
		Utils.printSummary('APEs', effects.plugin);
		Utils.printSummary('Images', assets);
		Utils.printSummary('Fonts', fonts);

		if (inputFiles.length > 1) {
			console.log(/* let it breathe */);
			console.log('─'.repeat(80))
		}
	}
}

