import { program } from 'commander';

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
		.command('diff <preset1> <preset2>')
		.description('approximates similarity between two AVS presets')
		.option('-D, --debug', 'print additional debug information', false)
		.option('-d, --details', 'print additionals details about the diff', false)
		.option('-l, --levenshtein', 'calculates Levenshtein distance', false)
		.option('-n, --needleman-wunsch', 'calculates Needleman-Wunsch alignment', false)
		.action(async (file1, file2, options) => {
			const { diff } = await import('./actions/diff');

			await diff(file1, file2, options)
		});

	program.parse();
}
