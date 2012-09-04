var fs = require('fs');
var path = require('path');
var async = require('async');
var underscore = require('underscore');

var MODULES_DIRNAME = 'web-modules';
var MODULES_CONF_FILENAME = 'module.json';
var CORE_SEPERATOR_KEY = '__core';

exports.init = function(options) {
  var sandboxPrototype = {};

  function initVendor(vendorsPath, vendorName, initDone) {
    var vendor = {
      path: path.join(vendorsPath, vendorName),
      name: vendorName
    };
    fs.readdir(vendor.path, function(err, list) {
      if (err) {
        initDone(err);
      }
      async.map(list, async.apply(initModule, vendor), initDone);
    });
  }

  var Module = {
    getInitMethod: function() {
      var module = require(this.path + '/server/script');
      return isCoreModule(this) ? module.initCore : module.init;
    },
    getDependencies: function() {
      dependencies = this.server.dependencies || [];
      // All non core modules depend on core
      if(!isCoreModule(this)) {
        dependencies.push(CORE_SEPERATOR_KEY);
      }
      return dependencies;
    }
  };

  function isCoreModule(module) {
    return module.name === 'http';
  }

  function initModule(vendor, moduleName, initDone) {
    var module = {
      path: path.join(vendor.path, moduleName),
      vendor: vendor,
      name: moduleName
    };
    async.waterfall([
      function readConfig(readDone) {
        var moduleConfigPath = path.join(module.path, MODULES_CONF_FILENAME);
        fs.readFile(moduleConfigPath, 'utf8', function (err, data) {
          readDone(err, err ? null : JSON.parse(data));
        });
      },
      function checkModuleConfig(data, checkDone) {
        if (!data.name) {
          checkDone('Name of module in ' + module.path + 'is missing');
          return;
        }
        if (data.name !== module.name) {
          checkDone('Name of module directory and module name should match!');
          return;
        }
        if (!data.vendor) {
          checkDone('Name of module in ' + module.path + 'is missing!');
          return;
        }
        if (data.vendor !== module.vendor.name) {
          checkDone('Name of vendor directory and module vendor name should match!');
          return;
        }
        checkDone(null, underscore(module).extend(data, Module));
      },
    ], function (err, module) {
      if (!err) {
        initDone(null, module);
        return;
      }
      initDone(null);
    });
  }

  async.waterfall([
    function webmodulesDirExists(checkDone) {
      var vendorsPath;
      var cwd;
      cwd = process.cwd();
      vendorsPath = path.join(cwd, MODULES_DIRNAME);
      fs.stat(vendorsPath, function (err, stats) {
        if (err || !stats.isDirectory()) {
          checkDone(err || 'Missing webmodules directory');
        }
        checkDone(null, vendorsPath);
      });
    },
    function loadModules(vendorsPath, loadDone) {
      fs.readdir(vendorsPath, function(err, list) {
        async.concat(list, async.apply(initVendor, vendorsPath), loadDone);
      });
    },
    function reorganizeConfig(modules, reoganizeDone) {
      var modulesObject = {};
      underscore.each(modules, function(module) {
        if (module) {
          var key = module.vendor + '/' + module.name;
          module.key = key;
          modulesObject[key] = module;
        }
      });
      reoganizeDone(null, modulesObject);
    },
    function initModules(modules, initDone) {
      var coreModules = underscore.filter(modules, isCoreModule);
      var coreModulesKeys = underscore.pluck(coreModules, 'key');
      coreModulesKeys.push(function (done) {
        done(null);
      });
      var initMethods = {};
      initMethods[CORE_SEPERATOR_KEY] = coreModulesKeys;
      underscore.each(modules, function(module) {
        var dependencies = module.getDependencies();
        dependencies.push(function(autoDone) {
          var sandbox = sandboxPrototype;
          if (!isCoreModule(module)) {
            sandbox = {};
            sandbox.__proto__ = sandboxPrototype;
          }
          module.getInitMethod()(sandbox, autoDone);
        });
        initMethods[module.key] = dependencies;
      });
      async.auto(initMethods, initDone);
    }
  ], function (err, modules) {
    console.log(modules);
  });
};
