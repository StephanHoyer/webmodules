var fs = require('fs');
var path = require('path');
var async = require('async');
var underscore = require('underscore');

var MODULES_DIRNAME = 'web-modules';
var MODULES_CONF_FILENAME = 'module.json';

exports.init = function(options) {
  var cwd;
  var i;

  function initVendor(vendorsPath, vendorName, callback) {
    var vendor = {
      path: path.join(vendorsPath, vendorName),
      name: vendorName
    };
    fs.readdir(vendor.path, function(err, list) {
      if (err) {
        callback(err);
      }
      async.map(list, async.apply(initModule, vendor), callback);
    });
  }

  function initModule(vendor, moduleName, callback) {
    var module = {
      path: path.join(vendor.path, moduleName),
      vendor: vendor,
      name: moduleName
    };
    async.waterfall([
      function readConfig(callback) {
        var moduleConfigPath = path.join(module.path, MODULES_CONF_FILENAME);
        fs.readFile(moduleConfigPath, 'utf8', function (err, data) {
          callback(err, err ? null : JSON.parse(data));
        });
      },
      function checkModuleConfig(data, callback) {
        if (!data.name) {
          callback('Name of module in ' + module.path + 'is missing');
          return;
        }
        if (data.name !== module.name) {
          callback('Name of module directory and module name should match!');
          return;
        }
        if (!data.vendor) {
          callback('Name of module in ' + module.path + 'is missing!');
          return;
        }
        if (data.vendor !== module.vendor.name) {
          callback('Name of vendor directory and module vendor name should match!');
          return;
        }
        callback(null, underscore.extend(data, module));
      }
    ], function (err, module) {
      if (!err) {
        callback(null, module);
        return;
      }
      callback(null);
    });
  }

  async.waterfall([
    function webmodulesDirExists(callback) {
      var vendorsPath;
      vendorsPath = path.join(cwd, MODULES_DIRNAME);
      fs.stat(vendorsPath, function (err, stats) {
        if (err || !stats.isDirectory()) {
          callback(err || 'Missing webmodules directory');
        }
        callback(null, vendorsPath);
      });
    },
    function loadVendors(vendorsPath, callback) {
      fs.readdir(vendorsPath, function(err, list) {
        async.concat(list, async.apply(initVendor, vendorsPath), callback);
      });
    },
  ], function (err, modules) {
    modules = underscore.filter(modules, underscore.identity);
    console.log(modules);
  });

  var sandboxPrototype = {};
  require('./examples/hello-world-server/web-modules/foo/http/server/script').load(sandboxPrototype);
  
  var sandbox = {};
  sandbox.__proto__ = sandboxPrototype;
  //require('./examples/hello-world-server/web-modules/foo/index/server/script').init(sandbox);
};
