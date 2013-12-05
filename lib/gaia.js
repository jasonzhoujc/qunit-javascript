var gaia = module.exports = {};
// 新增命名空间.
function gRequire(name) {
  return gaia[name] = require('./gaia/' + name);
}
gRequire('util');
gRequire('log');
