/*
 *
 */

'use strict';

var gaia = require('../gaia');

// The module to be exported.
var fail = module.exports = {};

// Error codes.
fail.code = {
	FATAL_ERROR: 1,
	MISSING_GRUNTFILE: 2,
	TASK_FAILURE: 3,
	TEMPLATE_ERROR: 4,
	INVALID_AUTOCOMPLETE: 5,
	WARNING: 6,
};

// DRY it up!
function writeln(e, mode) {
	gaia.log.muted = false;
	var msg = String(e.message || e);
	if (!gaia.option('no-color')) {
		msg += '\x07';
	} // Beep!
	if (mode === 'warn') {
		msg = 'Warning: ' + msg + ' ';
		msg += (gaia.option('force') ? 'Used --force, continuing.'.underline: 'Use --force to continue.');
		msg = msg.yellow;
	} else {
		msg = ('Fatal error: ' + msg).red;
	}
	gaia.log.writeln(msg);
}

// If --stack is enabled, log the appropriate error stack (if it exists).
function dumpStack(e) {
	if (gaia.option('stack')) {
		if (e.origError && e.origError.stack) {
			console.log(e.origError.stack);
		} else if (e.stack) {
			console.log(e.stack);
		}
	}
}

// A fatal error occured. Abort immediately.
fail.fatal = function(e, errcode) {
	writeln(e, 'fatal');
	dumpStack(e);
	process.exit(typeof errcode === 'number' ? errcode: fail.code.FATAL_ERROR);
};

// Keep track of error and warning counts.
fail.errorcount = 0;
fail.warncount = 0;

// A warning ocurred. Abort immediately unless -f or --force was used.
fail.warn = function(e, errcode) {
	var message = typeof e === 'string' ? e: e.message;
	fail.warncount++;
	writeln(message, 'warn');
	// If -f or --force aren't used, stop script processing.
	if (!gaia.option('force')) {
		dumpStack(e);
		gaia.log.writeln().fail('Aborted due to warnings.');
		process.exit(typeof errcode === 'number' ? errcode: fail.code.WARNING);
	}
};

// This gets called at the very end.
fail.report = function() {
	if (fail.warncount > 0) {
		gaia.log.writeln().fail('Done, but with warnings.');
	} else {
		gaia.log.writeln().success('Done, without errors.');
	}
};

