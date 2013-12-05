var ops = {
    // Unit tests.
    qunit: {
        all: ['test/qunit1.html']/*,
        all_tests: ['test/*{1,2}.html'],
        individual_tests: {
            files: [
                {src: 'test/*1.html'},
                {src: 'test/*{1,2}.html'}
            ]
        }*/
    }
};
// Build a mapping of url success counters.
debugger
var successes = {};
var currentUrl;
// External lib.
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var path = require('path');
var asset = path.join.bind(null, __dirname, '..');

// Awesome.
var myevent = module.exports = new EventEmitter2({wildcard: true});
myevent.on('qunit.spawn', function(url) {
    currentUrl = url;
    if (!successes[currentUrl]) { successes[currentUrl] = 0; }
});
myevent.on('qunit.done', function(failed, passed) {
    if (failed === 0 && passed === 2) { successes[currentUrl]++; }
});
gaia = require('./lib/gaia');
debugger
var myQunit = require('./lib/gaia/qunitProcess.js');
myQunit(myevent, ops);
