import * as updateNotifier from 'update-notifier';
import * as pkg from '../package.json';

updateNotifier({pkg}).notify();
