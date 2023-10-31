import { basename } from 'node:path';
import { convertFile } from './shared';
import { diffChars } from 'diff';
import { stat } from 'node:fs/promises';
import * as Utils from '../utils';
import colors from 'picocolors';
import leven from 'leven';
import logSymbols from 'log-symbols';
import prettyBytes from 'pretty-bytes';

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

	const sourceStats = await stat(sourceFile);
	const targetStats = await stat(targetFile);

	console.log(/* let it breathe */);
	console.log(`File #1: ${colors.green(basename(sourceFile))}`);
	if (options.details) {
		console.log(`- Size: ${colors.blue(prettyBytes(sourceStats.size))}`);
		console.log(`- Modified: ${colors.blue(new Date(sourceStats.mtime).toUTCString())}`);

		console.log(/* let it breathe */);
	}

	console.log(`File #2: ${colors.green(basename(targetFile))}`);
	if (options.details) {
		console.log(`- Size: ${colors.blue(prettyBytes(targetStats.size))}`);
		console.log(`- Modified: ${colors.blue(new Date(targetStats.mtime).toUTCString())}`);
	}

	printDistance('Preset', normalizedSource, normalizedTarget, options);
	if (options.details) {
		printDiff(sourcePreset, targetPreset);
	}

	printDistance('Effect Structure', sourceEffectStructure, targetEffectStructure, options);
	printDiff(sourceEffectStructure, targetEffectStructure);

	printDistance('Effect Group Structure', sourceGroupStructure, targetGroupStructure, options);
	printDiff(sourceGroupStructure, targetGroupStructure);
}

function printDistance(label, source, target, options) {
	const distance = leven(source, target);
	const averageLength = (source.length + target.length) / 2;

	console.log(/* let it breathe */);
	console.log(`${label}:`);

	const averageLengthString = [
		'-',
		'Average length:',
		colors.blue(averageLength),
		options.details ? colors.dim(`(${source.length}, ${target.length})`) : ''
	];

	const levenshteinDistance = [
		'-',
		'Levenshtein distance:',
		colors.blue(distance),
		options.details ? colors.dim(`(${distance / averageLength})`) : ''
	];

	console.log(averageLengthString.join(' '));
	console.log(levenshteinDistance.join(' '));
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
