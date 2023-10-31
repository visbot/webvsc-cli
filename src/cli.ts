import { program } from 'commander';
import { convert } from './actions/convert';
import { diff } from './actions/diff';
import { info } from './actions/info';

export function main() {
	program
		.command('convert <file...>')
		.description('convert presets to JSON format, supports glob patterns')
		.option('-D, --debug', 'print additional debug information', false)
		.option('-i, --indent <n>', 'specify default indentation JSON', i => parseInt(i, 10), 2)
		.option('-q, --quiet', 'print errors only')
		.option('-w, --watch', 'only convert changed files')
		.action(async (args, options) => {
			const { convert} = await import('./actions/convert');

			await convert(args, options)
		});

	program
		.command('info <file...>')
		.description('show info about AVS presets, supports glob patterns')
		.option('-D, --debug', 'print additional debug information', false)
		.option('-s, --summary', 'print summary of multiple presets', false)
		.action(async (args, options) => {
			const { info } = await import('./actions/info');

			await info(args, options)
		});

	program
		.command('diff <source> <target>')
		.description('approximates similarity between two AVS presets')
		.option('-D, --debug', 'print additional debug information', false)
		.option('-d, --details', 'print additionals details about the diff', false)
		.action(async (file1, file2, options) => {
			const { diff } = await import('./actions/diff');

			diff(file1, file2, options)
		});

	program.parse();
}
