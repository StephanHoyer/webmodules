exports.init = function(options) {
  var sandboxPrototype = {};
  require('./examples/hello-world-server/web-modules/index/http/server/script/index').load(sandboxPrototype);
  
  var sandbox = {};
  sandbox.__proto__ = sandboxPrototype;
  require('./examples/hello-world-server/web-modules/index/index/server/script/index').init(sandbox);
};
