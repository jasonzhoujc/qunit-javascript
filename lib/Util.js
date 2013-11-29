Util = module.exports = {};
var nodeUtil = require('util'),
    fs = require('fs'),
    path = require('path'),
    iconv = require('iconv-lite');

var spawn = require('child_process').spawn;

var _ = Util._ = require('lodash');
// Mixin Underscore.string methods.
_.str = require('underscore.string');
_.mixin(_.str.exports());
file = {};
// The default file encoding to use.
file.defaultEncoding = 'utf8';
// Whether to preserve the BOM on file.read rather than strip it.
file.preserveBOM = false;
Util.read = function(filepath, options) {
    if (!options) { options = {}; }
    var contents;
    console.log('Reading ' + filepath + '...');
    try {
        contents = fs.readFileSync(String(filepath));
        // If encoding is not explicitly null, convert from encoded buffer to a
        // string. If no encoding was specified, use the default.
        if (options.encoding !== null) {
            contents = iconv.decode(contents, options.encoding || file.defaultEncoding);
            // Strip any BOM that might exist.
            if (!file.preserveBOM && contents.charCodeAt(0) === 0xFEFF) {
                contents = contents.substring(1);
            }
        }
        console.log('contents:', contents);
        return contents;
    } catch(e) {
        throw Util.error('Unable to read "' + filepath + '" file (Error code: ' + e.code + ').', e);
    }
};
// Create a new Error object, with an origError property that will be dumped
// if grunt was run with the --debug=9 option.
Util.error = function(err, origError) {
    if (!nodeUtil.isError(err)) { err = new Error(err); }
    if (origError) { err.origError = origError; }
    return err;
};
// Spawn a child process, capturing its stdout and stderr.
Util.spawn = function(opts, done) {
    // Build a result object and pass it (among other things) into the
    // done function.
    var callDone = function(code, stdout, stderr) {
        // Remove trailing whitespace (newline)
        stdout = _.rtrim(stdout);
        stderr = _.rtrim(stderr);
        // Create the result object.
        var result = {
            stdout: stdout,
            stderr: stderr,
            code: code,
            toString: function() {
                if (code === 0) {
                    return stdout;
                } else if ('fallback' in opts) {
                    return opts.fallback;
                } else if (opts.grunt) {
                    // grunt.log.error uses standard out, to be fixed in 0.5.
                    return stderr || stdout;
                }
                return stderr;
            }
        };
        // On error (and no fallback) pass an error object, otherwise pass null.
        done(code === 0 || 'fallback' in opts ? null : new Error(stderr), result, code);
    };

    var cmd, args;
    var pathSeparatorRe = /[\\\/]/g;
    if (opts.grunt) {
        cmd = process.argv[0];
        args = [process.argv[1]].concat(opts.args);
    } else {
        // On Windows, child_process.spawn will only file .exe files in the PATH,
        // not other executable types (grunt issue #155).
        try {
            if (!pathSeparatorRe.test(opts.cmd)) {
                // Only use which if cmd has no path component.
                cmd = which(opts.cmd);
            } else {
                cmd = opts.cmd.replace(pathSeparatorRe, path.sep);
            }
        } catch (err) {
            callDone(127, '', String(err));
            return;
        }
        args = opts.args;
    }

    var child = spawn(cmd, args, opts.opts);
    var stdout = new Buffer('');
    var stderr = new Buffer('');
    if (child.stdout) {
        child.stdout.on('data', function(buf) {
            stdout = Buffer.concat([stdout, new Buffer(buf)]);
        });
    }
    if (child.stderr) {
        child.stderr.on('data', function(buf) {
            stderr = Buffer.concat([stderr, new Buffer(buf)]);
        });
    }
    child.on('close', function(code) {
        callDone(code, stdout.toString(), stderr.toString());
    });
    return child;
};
