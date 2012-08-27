exports.init = function(sandbox) {
  var http = require('http');
  sandbox.server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(
      '<html><head><title>Hello world!</title>' +
      sandbox.webmodules.getStyles() +
      '</head><body>Hello World' + 
      sandbox.webmodules.getScripts() +
      '</body></html>'
    );
  });
  sandbox.server.listen(8000);
};
