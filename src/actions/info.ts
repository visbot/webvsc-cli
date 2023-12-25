import { convertFile, defaultOptions } from "./shared";
import { glob } from 'glob';
import * as Utils from '../utils';

export async function info(inputFiles, options = defaultOptions) {
	const colors = (await import('picocolors')).default;

	const summary = {
		assets: [],
		effects: {
			builtin: [],
			plugin: []
		},
		fonts: [],
		presets: []
	};

	for (const avsFile of await glob(inputFiles.sort())) {
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

		const effects = Utils.separateEffects(webvs.components);
		const assets = Utils.getImageAssets(webvs.components);
		const fonts = Utils.getFontAssets(webvs.components);

		if (options.summary) {
			if (effects.builtin?.length) {
				for (const builtin of effects.builtin.sort()) {
					summary.effects.builtin.push(builtin);
				}
			}

			if (effects.plugin?.length) {
				for (const plugin of effects.plugin.sort()) {
					summary.effects.plugin.push(plugin);
				}
			}

			if (assets?.length) {
				for (const asset of assets.sort()) {
					summary.assets.push(asset);
				}
			}

			if (fonts?.length) {
				for (const font of fonts.sort()) {
					summary.fonts.push(font);
				}
			}


			if (avsFile) {
				summary.presets.push(avsFile);
			}
		} else {
			console.log(/* let it breathe */);
			console.log(`File: ${colors.green(avsFile)}`);
			console.log(/* let it breathe */);

			const { hash, modified, size } = await Utils.getFileInfo(avsFile);

			console.log(`Size: ${colors.blue(size)}`);
			console.log(`Modified: ${colors.blue(modified)}`);
			console.log(`SHA-256: ${colors.blue(hash)}`);

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
		// console.log('SUMMARY', summary.effects)
		Utils.printSummary('Presets', summary.presets.sort());
		Utils.printSummary('Effects', summary.effects.builtin.sort());
		Utils.printSummary('APEs', summary.effects.plugin.sort());
		Utils.printSummary('Images', summary.assets.sort());
		Utils.printSummary('Fonts', summary.fonts.sort());
	}
}
