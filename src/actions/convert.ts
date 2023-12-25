import { basename, dirname, extname, join } from "node:path";
import { convertFile, defaultOptions } from "./shared";
import { glob } from 'glob';
import { writeFile } from 'node:fs/promises';
import * as Utils from '../utils';
import logSymbols from 'log-symbols';

export async function convert(inputFiles, options = defaultOptions) {
	if (options.watch) {
		await __watch(inputFiles, options);
	} else {
		if (!options.quiet) {
			console.log(/* let it breathe */);
			console.time('✨ Completed');
		}

		await __convert(inputFiles, options);

		if (!options.quiet) {
			console.log(/* let it breathe */);
			console.timeEnd('✨ Completed');
		}
	}
}

async function __watch(inputFiles, options = defaultOptions) {
	const { watch } = await import('chokidar');

	if (!options.quiet) {
		console.log(/* let it breathe */);
		console.log('👓 Watching for changes...');
		console.log(/* let it breathe */);
	}

	const watcher = watch(inputFiles, {
		awaitWriteFinish: {
			stabilityThreshold: 5
		}
	});

	const dictionary = {};

	watcher.on('change', async inputFile => {
		const hash = await Utils.hashFile(inputFile, 'sha1');

		if (hash === dictionary[inputFile]) {
			return;
		}

		await __convert(inputFile, options);

		dictionary[inputFile] = hash;
	});
}

async function __convert(inputFiles, options = defaultOptions) {
	const colors = (await import('picocolors')).default;

	const avsFiles = Array.isArray(inputFiles)
		? inputFiles
		: [inputFiles];

	for (const avsFile of await glob(avsFiles.sort())) {
		const presetExtension = extname(avsFile);

		if (!['.avs', '.wvs'].includes(presetExtension)) {
			if (!options.quiet) {
				console.warn(logSymbols.warning, `Skipping conversion ${colors.cyan(avsFile)}`);
			}
			return;
		}

		const presetDir = options?.outdir || dirname(avsFile);
		const presetName = basename(avsFile, presetExtension);
		const start = performance.now();

		try {
			const webvs = await convertFile(avsFile, options);
			await writeFile(`${join(presetDir, presetName)}.webvs`, JSON.stringify(webvs, null, options.indent), 'utf-8');

			if (!options.quiet) {
				console.log(logSymbols.success, `Converted ${colors.cyan(`${presetName}.avs`)} ${Utils.formatDuration(start)}`);
			}
		} catch (err) {
			console.error(logSymbols.error, `Converted ${colors.cyan(`${presetName}.avs`)} ${Utils.formatDuration(start)}`);

			if (options.debug) {
				console.log(/* let it breathe */);
				console.error(err instanceof Error ? colors.red(err.message) : colors.red(err));
			}

			continue;
		}
	}
}
