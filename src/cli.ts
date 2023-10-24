import { program } from 'commander';
import * as actions from './actions';

export function main() {
	program
		.command('convert <file...>')
		.description('convert presets to JSON format')
		.option('-d, --debug', 'print additional debug information')
		.option('-v, --verbose <n>', 'control the amount of output displayed', i => parseInt(i, 10))
		.option('-i, --indent <n>', 'specify default indentation JSON', i => parseInt(i, 10), 2)
		.option('-q, --quiet', 'print errors only')
		.option('-H, --no-hidden', 'don\'t extract hidden strings from fixed-size strings')
		.option('-w, --watch', 'only convert changed files')
		.action(actions.convert);

	program
		.command('info <file...>')
		.description('show info about AVS presets')
		.option('-d, --debug', 'print additional debug information')
		.option('-s, --summary', 'print summary of multiple presets', false)
		.action(actions.info);

	program.parse();
}
