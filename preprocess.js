'use strict';

const { createInterface } = require('readline');

const rl = createInterface({ input: process.stdin });

const toc = [];
let tocLevel = 0;
let hasToC = false;
const buffer = [];
let inToC = false;

const output = !process.argv.includes('--toc');

const handler = (line, addToC = false) => {
	const match = line.match(/^(?<level>#+) (?<title>.+)/);
	if (match) {
		const { groups: { level, title } } = match;
		if (addToC) {
			toc.push([ level.length - 1, title ]);
		}
		if (title === 'TOC' || title === 'Table of Contents') {
			tocLevel = level.length;
			if (hasToC) {
				buffer.push(line);
			}
			hasToC = true;
			return;
		}
	}
	if (hasToC) {
		buffer.push(line);
		return;
	}
	if (line === '[//]: # (TOC:START)') {
		inToC = true;
	}
	if (line === '[//]: # (TOC:END)') {
		inToC = false;
		return;
	}
	if (!inToC && output) {
		console.log(line);
	}
};

const done = () => {
	if (hasToC) {
		if (output) {
			console.log('#'.repeat(tocLevel) + ' Table of Contents\n');
			console.log('[//]: # (TOC:START)\n');
		}
		toc.forEach(([ level, title ]) =>
			console.log(
				'\t'.repeat(level) +
				'1. [' +
				title +
				'](#' +
				title
					.toLowerCase()
					.replace(/[^- \w]/g, '')
					.replace(/ /g, '-') +
				')'));
		if (output) {
			console.log('');
			console.log('[//]: # (TOC:END)\n');
		}
		hasToC = false;
		while (buffer[0] === '') {
			buffer.splice(0, 1);
		}
		buffer
			.reduce((acc, x) => [
				...acc,
				// eslint-disable-next-line no-nested-ternary
				...acc[acc.length - 1] === ''
					? x === ''
						? []
						: [ x ]
					: [ x ]
			], [])
			.splice(0, Infinity)
			.forEach(handler);
		if (hasToC) {
			done();
		}
	}
};

rl.on('line', line => handler(line, true));
rl.once('close', done);
