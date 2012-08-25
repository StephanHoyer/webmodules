exports.init = function(options) {
  var sandboxPrototype = {};
  require('./examples/hello-world-server/web-modules/foo/http/server/script').load(sandboxPrototype);
  
  var sandbox = {};
  sandbox.__proto__ = sandboxPrototype;
  require('./examples/hello-world-server/web-modules/foo/index/server/script').init(sandbox);
};
