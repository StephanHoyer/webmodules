exports.load = function(sandboxPrototype) {
  var http = require('http');
  sandboxPrototype.server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello world!');
  });
};

exports.unload = function(sandboxPrototype) {

};
