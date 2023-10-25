import { convertFile, defaultOptions } from './shared';
import * as Utils from '../utils';
import leven from 'leven';
import Seq from 'seqalign';

const nw = Seq.NWaligner();
const sw = Seq.SWaligner();

export async function diff(sourceFile, targetFile, options = defaultOptions) {

	console.log();
	let sourceJSON = await convertFile(sourceFile, options);

	delete sourceJSON.name;
	delete sourceJSON.date;
	sourceJSON = JSON.stringify(sourceJSON).replaceAll(':true', ':1').replaceAll(':false', ':0');

	let targetJSON = await convertFile(targetFile, options);
	delete targetJSON.name;
	delete targetJSON.date;
	targetJSON = JSON.stringify(targetJSON).replaceAll(':true', ':1').replaceAll(':false', ':0');

	let averageLength = (sourceJSON.length + targetJSON.length) / 2;
	let lDistance = leven(sourceJSON, targetJSON);
	let difference = averageLength * (lDistance / 100);

	console.log('Raw file:', {
		source: {
			contents: sourceJSON,
			length: sourceJSON.length
		},
		target: {
			contents: targetJSON,
			length: targetJSON.length
		},
		averageLength: (sourceJSON.length + targetJSON.length) / 2,
		distance: lDistance,
		difference,
		// aligner: {
		// 	smithWaterman: sw.align(sourceJSON, targetJSON),
		// 	needlemanWunsch: nw.align(sourceJSON, targetJSON)
		// }
	});

	console.log();

	const sourceStructure = await getStructure(sourceFile, options);
	const targetStructure = await getStructure(targetFile, options);
	averageLength = (sourceStructure.length + targetStructure.length) / 2;
	lDistance = leven(sourceStructure, targetStructure);

	difference = averageLength * (lDistance / 100);

	console.log('Effect structure:', {
		source: {
			contents: sourceStructure,
			length: sourceStructure.length
		},
		target: {
			contents: targetStructure,
			length: targetStructure.length
		},
		averageLength,
		distance: lDistance,
		difference,
		aligner: {
			smithWaterman: sw.align(sourceStructure, targetStructure),
			needlemanWunsch: nw.align(sourceStructure, targetStructure)
		}
	});

	console.log();

	const sourceGroupStructure = await getStructure(sourceFile, options, 'group');
	const targetGroupStructure = await getStructure(targetFile, options, 'group');
	averageLength = (sourceGroupStructure.length + targetGroupStructure.length) / 2;
	lDistance = leven(sourceGroupStructure, targetGroupStructure);
	difference = averageLength * (lDistance / 100);

	console.log('Group structure:', {
		source: {
			contents: sourceGroupStructure,
			length: sourceGroupStructure.length
		},
		target: {
			contents: targetGroupStructure,
			length: targetGroupStructure.length
		},
		averageLength,
		distance: lDistance,
		difference: difference,
		aligner: {
			smithWaterman: sw.align(sourceGroupStructure, targetGroupStructure),
			needlemanWunsch: nw.align(sourceGroupStructure, targetGroupStructure)
		}
	});
}



async function getStructure(avsFile, options, group = 'type') {
	const webvs = await convertFile(avsFile, options);
	const structure = Utils.mapTypes(webvs.components, group);

	return JSON.stringify(structure);
}
