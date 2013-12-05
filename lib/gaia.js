var gaia = module.exports = {};
// 新增命名空间.
function gRequire(name) {
  return gaia[name] = require('./gaia/' + name);
}
var util = gRequire('util');
var log = gRequire('log');
var file = gRequire('file');
var option = gRequire('option');
var fail = gRequire('fail');
var verbose = gaia.verbose = log.verbose;
