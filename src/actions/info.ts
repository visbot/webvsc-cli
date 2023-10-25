import { convertFile, defaultOptions } from "./shared";
import { stat } from 'node:fs/promises';
import * as Utils from '../utils';
import colors from 'picocolors';
import prettyBytes from "pretty-bytes";

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

		const { mtime, size } = await stat(avsFile);
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

			console.log(`Size: ${colors.blue(prettyBytes(size))}`);
			console.log(`Modified: ${colors.blue(new Date(mtime).toUTCString())}`);
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
