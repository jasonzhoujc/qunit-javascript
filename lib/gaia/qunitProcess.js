/*
 * qunit处理
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(myevent, ops) {

	// Nodejs libs.
	var path = require('path');

	// External lib.
	var phantomjs = require('./phantomjsProcess.js').init();

	// Keep track of the last-started module, test and status.
	var currentModule, currentTest, status;
	// Keep track of the last-started test(s).
	var unfinished = {};

	// Get an asset file, local to the root of the project.
	var asset = path.join.bind(null, __dirname, '..');

	// Allow an error message to retain its color when split across multiple lines.
	var formatMessage = function(str) {
		return String(str).split('\n').map(function(s) {
			return s.magenta;
		}).join('\n');
	};

	// Keep track of failed assertions for pretty-printing.
	var failedAssertions = [];
	var logFailedAssertions = function() {
		var assertion;
		// Print each assertion error.
		while (assertion = failedAssertions.shift()) {
			gaia.verbose.or.error(assertion.testName);
			gaia.log.error('Message: ' + formatMessage(assertion.message));
			if (assertion.actual !== assertion.expected) {
				gaia.log.error('Actual: ' + formatMessage(assertion.actual));
				gaia.log.error('Expected: ' + formatMessage(assertion.expected));
			}
			if (assertion.source) {
				gaia.log.error(assertion.source.replace(/ {4}(at)/g, '  $1'));
			}
			gaia.log.writeln();
		}
	};

	// QUnit hooks.
	phantomjs.on('qunit.moduleStart', function(name) {
		unfinished[name] = true;
		currentModule = name;
	});

	phantomjs.on('qunit.moduleDone', function(name
	/*, failed, passed, total*/
	) {
		delete unfinished[name];
	});

	phantomjs.on('qunit.log', function(result, actual, expected, message, source) {
		if (!result) {
			failedAssertions.push({
				actual: actual,
				expected: expected,
				message: message,
				source: source,
				testName: currentTest
			});
		}
	});

	phantomjs.on('qunit.testStart', function(name) {
		currentTest = (currentModule ? currentModule + ' - ': '') + name;
		gaia.verbose.write(currentTest + '...');

	});

	phantomjs.on('qunit.testDone', function(name, failed
	/*, passed, total*/
	) {
		// Log errors if necessary, otherwise success.
		if (failed > 0) {
			// list assertions
			if (gaia.option('verbose')) {
				gaia.log.error();
				logFailedAssertions();
			} else {
				gaia.log.write('F'.red);
			}
		} else {
			gaia.verbose.ok().or.write('.');
		}
	});

	phantomjs.on('qunit.done', function(failed, passed, total, duration) {
		phantomjs.halt();
		status.failed += failed;
		status.passed += passed;
		status.total += total;
		status.duration += duration;
		// Print assertion errors here, if verbose mode is disabled.
		if (!gaia.option('verbose')) {
			if (failed > 0) {
				gaia.log.writeln();
				logFailedAssertions();
			} else if (total === 0) {
				gaia.fail.warn('0/0 assertions ran (' + duration + 'ms)');
			} else {
				gaia.log.ok();
			}
		}
	});

	// Re-broadcast qunit events on gaia.event.
	phantomjs.on('qunit.*', function() {
		var args = [this.event].concat(gaia.util.toArray(arguments));
		//gaia.event.emit.apply(gaia.event, args);
        myevent.emit.apply(myevent, args);
	});

	// Built-in error handlers.
	phantomjs.on('fail.load', function(url) {
		phantomjs.halt();
		gaia.verbose.write('Running PhantomJS...').or.write('...');
		gaia.log.error();
		gaia.fail.warn('PhantomJS unable to load "' + url + '" URI.');
	});

	phantomjs.on('fail.timeout', function() {
		phantomjs.halt();
		gaia.log.writeln();
		gaia.fail.warn('PhantomJS timed out, possibly due to a missing QUnit start() call.');
	});

	// Pass-through console.log statements.
	phantomjs.on('console', console.log.bind(console));
	// Merge task-specific and/or target-specific options with these defaults.
	//});
	new qunitTask(ops);
	function qunitTask(ops) {
		debugger
		this.filesSrc = ops.qunit.all.join(''); // 写死 todo
		var options = {
			// Default PhantomJS timeout.
			timeout: 5000,
			// QUnit-PhantomJS bridge file to be injected.
			inject: asset('gaia/qunitPlugin.js'),
			// Explicit non-file URLs to test.
			urls: [],
		};

		// Combine any specified URLs with src files.
		var urls = options.urls.concat(this.filesSrc);

		// This task is asynchronous. 标示任务完成的
		// var done = this.async();
		// Reset status.
		status = {
			failed: 0,
			passed: 0,
			total: 0,
			duration: 0
		};

		// Process each filepath in-order.
		gaia.util.async.forEachSeries(urls, function(url, next) {
			var basename = path.basename(url);
			gaia.verbose.subhead('Testing ' + url + ' ').or.write('Testing ' + url + ' ');
			// Reset current module.
			currentModule = null;

			// Launch PhantomJS.
			myevent.emit('qunit.spawn', url);
			phantomjs.spawn(url, {
				// Additional PhantomJS options.
				options: options,
				// Do stuff when done.
				done: function(err) {
					if (err) {
						// If there was an error, abort the series.
						//done();
						console.log('done:', err);
					} else {
						// Otherwise, process next url.
						next();
					}
				},
			});
		},
		// All tests have been run.
		function() {
			// Log results.
			if (status.failed > 0) {
				gaia.fail.warn(status.failed + '/' + status.total + ' assertions failed (' + status.duration + 'ms)');
			} else if (status.total === 0) {
				gaia.fail.warn('0/0 assertions ran (' + status.duration + 'ms)');
			} else {
				gaia.verbose.writeln();
				gaia.log.ok(status.total + ' assertions passed (' + status.duration + 'ms)');
			}
			// All done!
			//done();
			console.log('all done');
		});
	}
};

