import { createReadStream, promises as fs } from 'node:fs';
import { stat } from 'node:fs/promises';
import colors from 'picocolors';

const pluginEffects = [
	'AddBorders',
	'AVIPlayer',
	'AVSTransAutomation',
	'BufferBlend',
	'ChannelShift',
	'ColorMap',
	'ColorReduction',
	'ConvolutionFilter',
	'Fluid',
	'FramerateLimiter',
	'FyrewurX',
	'GlobalVariables',
	'MIDITrace',
	'MultiDelay',
	'MultiFilter',
	'Multiplier',
	'Normalize',
	'ParticleSystem',
	'PictureII',
	'Texer',
	'TexerII',
	'Triangle',
	'VideoDelay'
];

const impactfulEffects = [
	'Bump',
	// 'ColorMap',
	// 'ConvolutionFilter',
	'DynamicDistanceModifier',
	'DynamicMovement',
	'DynamicShift',
	'Movement',
	'SuperScope',
	'TexerII'
];

const formatter = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 1,
	maximumFractionDigits: 4
});

function isAPE(type: string) {
	return pluginEffects.includes(type);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function getImageAssets(components: any) {
	const foundAssets = [];

	for (const component of components) {
		let image = '';

		switch (component.type) {
			case 'Picture':
			case 'PictureII':
			case 'Texer':
				image = component.image;
				break;

			case 'TexerII':
				image = component.imageSrc;
				break;

			case 'AVIPlayer':
				image = component.filePath;
				break;

			default:
				break;
		}

		if (image?.length) {
			foundAssets.push(image);
		}
	}

	return foundAssets.sort();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function getFontAssets(components: any) {
	const foundAssets = [];

	for (const component of components) {
		if (component.type === 'Text') {
			foundAssets.push(component.fontName)
		}
	}

	return foundAssets;
}

export function separateEffects(components = []) {
	const builtinEffects = [];
	const pluginEffects = [];

	for (const item of components) {
		if (isAPE(item.type)) {
			pluginEffects.push(item.type);
		}

		if (!isAPE(item.type)) {
			builtinEffects.push(item.type);
		}
	}

	return {
		builtin: builtinEffects,
		plugin: pluginEffects
	}
}


export function printSummary(label: string, items: string[]) {
	const uniqueItems = items.reduce(
		(acc, curr) =>
			acc.find((v) => v === curr) ? acc : [...acc, curr],
		[]
	);

	if (uniqueItems.length) {
		console.log(/* let it breathe */);
		console.log(`${label}:`);

		for (const item of uniqueItems.sort()) {
			const occurences = items.filter(i => i === item).length;
			console.log(`- ${colors.cyan(item)} ${colors.dim('(' + occurences + ')')}`);
		}
	}
}

async function hashStream(stream: NodeJS.ReadableStream, algorithm = 'sha256'): Promise<string> {
	const { createHash } = await import('node:crypto');

	const hashingFunction = createHash(algorithm);

	return new Promise((resolve, reject) => {
		stream
			.pipe(hashingFunction)
			.on('error', error => reject(error))
			.on('data', buffer => resolve(buffer.toString('hex').toLowerCase()));
	});
}

export async function hashFile(inputFile: string, algorithm = 'sha256'): Promise<string> {
	await fs.access(inputFile);

	return await hashStream(createReadStream(inputFile), algorithm);
}

export function mapTypes(components, key = 'type') {
	return components.map(i => {
		if (i.type === 'EffectList') {
			return mapTypes(i.components, key);
		}

		return i[key];
	});
}

export function getCodableEffects(components) {
	const effects = [];

	components
		.forEach(i => {
			if (!impactfulEffects.includes(i.type) && i.type !== 'EffectList') {
				return;
			}

		if (i.type === 'EffectList') {
			effects.push({
				type: i.type,
				code: {
					init: i.code.init,
					perFrame: i.code.perFrame
				}
			});

			effects.push(...getCodableEffects(i.components));
			return;
		}

		effects.push({
			type: i.type,
			code: i.code
		});
	});

	return effects;
}

export function formatDuration(start) {
	const end = performance.now();
	const duration = formatter.format((end - start));

	return colors.dim(`${duration}ms`);
}

export function normalizePreset(preset) {
	// strip metadata
	delete preset.name;
	delete preset.date;

	return JSON
		.stringify(preset)
		.replaceAll(':true', ':1')
		.replaceAll(':false', ':0');
}

export async function getFileInfo(filePath: string)	{
	const prettyBytes = (await import('pretty-bytes')).default;

	const { ctime, mtime, size } = await stat(filePath);

	return {
		created: new Date(ctime).toUTCString(),
		modified: new Date(mtime).toUTCString(),
		hash: await hashFile(filePath),
		size: prettyBytes(size)
	}
}
