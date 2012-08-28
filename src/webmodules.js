var fs = require('fs');
var path = require('path');
var async = require('async');


var MODULES_DIRNAME = 'web-modules';


exports.init = function(options) {
  var cwd;
  var i;
  var modules;
  var modulesPath;
  var vendor;
  var vendorsPath;

  function initVendor(vendorName, vendorComplete) {
    modulesPath = path.join(vendorsPath, vendorName);
    fs.readdir(modulesPath, function (err, modulesList) {
      if (!modulesList.length) {
        return;
      }
      vendor = modules[vendorName] = {};
      async.forEach(modulesList, function (moduleName, moduleComplete) {
        vendor[moduleName] = {};
        moduleComplete();
      }, vendorComplete);
    });
  }

  modules = {};
  cwd = process.cwd();
  vendorsPath = path.join(cwd, MODULES_DIRNAME);
  fs.readdir(vendorsPath, function (err, vendorList) {
    async.forEach(vendorList, initVendor, function(err) {
      console.log(modules);
    });
  });

  var sandboxPrototype = {};
  require('./examples/hello-world-server/web-modules/foo/http/server/script').load(sandboxPrototype);
  
  var sandbox = {};
  sandbox.__proto__ = sandboxPrototype;
  //require('./examples/hello-world-server/web-modules/foo/index/server/script').init(sandbox);
};
