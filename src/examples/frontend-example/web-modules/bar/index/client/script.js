'client: allow';

(function(define) {
  'use strict';
  define({
    load: ['darth/vader', function(vader, sandbox) {
      sandbox.log(vader.force());
    }],
    unload: function(sandboxPrototype) {

    }
  });
}(define));

