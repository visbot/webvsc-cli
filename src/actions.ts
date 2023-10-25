import { basename, extname } from 'node:path';
import { convertPreset } from '@visbot/webvsc';
import { promises as fs } from 'node:fs';
import { watch } from 'chokidar';
import * as Utils from './utils';
import colors from 'picocolors';
import logSymbols from 'log-symbols';
import prettyBytes from 'pretty-bytes';

const defaultOptions = {
	indent: 2,
	debug: false,
	summary: false,
	watch: false
}

async function convertFile(avsFile: string, options = defaultOptions) {
	const presetName = basename(avsFile, '.avs');
	const avsBuffer = await fs.readFile(avsFile);
	const modifiedDate = ((await fs.stat(avsFile)).mtime || new Date()).toISOString();

	try {
		return JSON.parse(avsBuffer.toString());
	} catch (error) {
		return convertPreset(avsBuffer, presetName, modifiedDate, options);
	}
}

export async function convert(inputFiles, options = defaultOptions) {
	if (options.watch) {
		__watch(inputFiles, options);
	} else {
		console.log(/* let it breathe */);
		console.time('✨ Completed');

		await __convert(inputFiles, options);

		console.log(/* let it breathe */);
		console.timeEnd('✨ Completed');
	}
}

function __watch(inputFiles, options = defaultOptions) {
	console.log(/* let it breathe */);
	console.log('👓 Watching for changes...');
	console.log(/* let it breathe */);

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
	const avsFiles = Array.isArray(inputFiles)
		? inputFiles
		: [ inputFiles ];

	for (const avsFile of avsFiles.sort()) {
		const presetExtension = extname(avsFile);

		if (!['.avs', '.wvs'].includes(presetExtension)) {
			console.warn(logSymbols.warning, `Skipping conversion ${colors.cyan(avsFile)}`);
			return;
		}

		const presetName = basename(avsFile, presetExtension);
		const start = performance.now();

		try {
			const webvs = await convertFile(avsFile, options);
			await fs.writeFile(`${presetName}.webvs`, JSON.stringify(webvs, null, options.indent), 'utf-8');

			console.log(logSymbols.success, `Converted ${colors.cyan(`${presetName}.avs`)} ${Utils.formatDuration(start)}`);
		} catch (err) {

			console.error(logSymbols.error, `Converted ${colors.cyan(`${presetName}.avs`)} ${Utils.formatDuration(start) }`);

			if (options.debug) {
				console.log(/* let it breathe */);
				console.error(err instanceof Error ? colors.red(err.message) : colors.red(err));
			}

			continue;
		}
	}
}

export async function info(inputFiles, options = defaultOptions) {
	const summary = {
		assets: [],
		effects: {
			builtin: [],
			plugin: []
		},
		fonts: [],
		presets: []
	};

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

		if (options.summary) {
			if (effects.builtin?.length) {
				for (const builtin of effects.builtin.sort()) {
					if (!summary.effects.builtin.includes(builtin)) {
						summary.effects.builtin.push(builtin);
					}
				}
			}

			if (effects.plugin?.length) {
				for (const plugin of effects.plugin.sort()) {
					if (!summary.effects.plugin.includes(plugin)) {
						summary.effects.plugin.push(plugin);
					}
				}
			}

			if (assets?.length) {
				for (const asset of assets.sort()) {
					if (!summary.assets.includes(asset)) {
						summary.assets.push(asset);
					}
				}
			}

			if (fonts?.length) {
				for (const font of fonts.sort()) {
					if (!summary.fonts.includes(font)) {
						summary.fonts.push(font);
					}
				}
			}


			if (avsFile && !summary.presets.includes(avsFile)) {
				summary.presets.push(avsFile);
			}
		} else {
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

	if (options.summary) {
		Utils.printSummary('Presets', summary.presets.sort());
		Utils.printSummary('Effects', summary.effects.builtin.sort());
		Utils.printSummary('APEs', summary.effects.plugin.sort());
		Utils.printSummary('Images', summary.assets.sort());
		Utils.printSummary('Fonts', summary.fonts.sort());
	}
}

async function getStructure(avsFile, options, group = 'type') {
	const webvs = await convertFile(avsFile, options);
	const structure = Utils.mapTypes(webvs.components, group);

	return JSON.stringify(structure);
}
