import { basename } from 'node:path';
import { convertFile } from './shared';
import { diffChars } from 'diff';
import * as Utils from '../utils';
import colors from 'picocolors';
import logSymbols from 'log-symbols';

type Options = {
	debug: boolean,
	details: boolean
}

export const defaultOptions: Options = {
	debug: false,
	details: false
}

export async function diff(sourceFile, targetFile, options = defaultOptions) {
	if (options.debug) {
		console.log({
			sourceFile,
			targetFile,
			options
		});
	}

	if (sourceFile === targetFile) {
		console.log(/* let it breathe */);
		console.log (`${logSymbols.warning} The two files are the same`);
	}

	const sourcePreset = await convertFile(sourceFile, options);
	const targetPreset = await convertFile(targetFile, options);

	const normalizedSource = Utils.normalizePreset(sourcePreset);
	const normalizedTarget = Utils.normalizePreset(targetPreset);

	const sourceEffectStructure = await getStructure(sourcePreset, 'type');
	const targetEffectStructure = await getStructure(targetPreset, 'type');

	const sourceGroupStructure = await getStructure(sourcePreset, 'group');
	const targetGroupStructure = await getStructure(targetPreset, 'group');

	console.log(/* let it breathe */);
	console.log(`File #1: ${colors.green(basename(sourceFile))}`);

	if (options.details) {
		const { modified, size } = await Utils.getFileInfo(sourceFile);

		console.log(`- Size: ${colors.blue(size)}`);
		console.log(`- Modified: ${colors.blue(modified)}`);

		console.log(/* let it breathe */);
	}

	console.log(`File #2: ${colors.green(basename(targetFile))}`);

	if (options.details) {
		const { modified, size } = await Utils.getFileInfo(targetFile);

		console.log(`- Size: ${colors.blue(size)}`);
		console.log(`- Modified: ${colors.blue(modified)}`);
	}

	await printDistance('Preset', normalizedSource, normalizedTarget, options);
	if (options.details) {
		printDiff(sourcePreset, targetPreset);
	}

	await printDistance('Effect Structure', sourceEffectStructure, targetEffectStructure, options);
	printDiff(sourceEffectStructure, targetEffectStructure);

	await printDistance('Effect Group Structure', sourceGroupStructure, targetGroupStructure, options);
	printDiff(sourceGroupStructure, targetGroupStructure);
}

async function printDistance(label, source, target, options) {
	console.log(/* let it breathe */);

	const logMessages = [];
	const averageLength = (source.length + target.length) / 2;

	logMessages.push(`${label}:`);

	const averageLengthString = [
		'-',
		'Average length:',
		colors.blue(averageLength),
		options.details ? colors.dim(`(${source.length}/${target.length})`) : ''
	];

	logMessages.push(averageLengthString.join(' '));

	if (options.levenshtein) {
		const leven = (await import('leven')).default;
		const distance = leven(source, target);

		const levenshteinDistance = [
			'-',
			'Levenshtein distance:',
			colors.blue(distance),
			options.details ? colors.dim(`(${distance / averageLength})`) : ''
		];

		logMessages.push(levenshteinDistance.join(' '));
	}

	if (options.needlemanWunsch) {
		const { NWaligner } = await import('seqalign');

		const aligner = NWaligner();

		const { score, alignment } = aligner.align(source, target);
		const [ sourceAlignment, targetAlignment ] = alignment.split('\n');

		logMessages.push(`- Needleman-Wunsch score: ${colors.blue(score)}`);
		logMessages.push(`  - Source: ${colors.dim(sourceAlignment)}`);
		logMessages.push(`  - Target: ${colors.dim(targetAlignment)}`);
	}

	logMessages.map(message => console.log(message));
}

function printDiff(source, target) {
	const sourceJSON = typeof source === 'string' ? source : JSON.stringify(source);
	const targetJSON = typeof target === 'string' ? target : JSON.stringify(target);

	const difference = diffChars(sourceJSON, targetJSON);

	const output = difference.map(part => {
		switch (true) {
			case part.added:
				return colors.green(part.value);

			case part.removed:
				return colors.red(part.value);

			default:
				return colors.dim(part.value);
		}
	});

	console.log('- Diff:', output.join(''));
}

async function getStructure(preset, group) {
	const structure = Utils.mapTypes(preset.components, group);

	return JSON.stringify(structure);
}
