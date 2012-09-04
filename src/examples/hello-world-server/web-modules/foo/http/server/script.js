exports.initCore = function(sandboxPrototype, initDone) {
  var http = require('http');
  sandboxPrototype.server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello world!');
  });
  initDone(null);
};

exports.unload = function(sandboxPrototype) {

};
