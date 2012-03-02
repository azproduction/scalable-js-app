function Logger(require, exports, module) {
    // this modules is safe - can include orther modules
    var log = require('console').log;

    "use strict";
    var printLog = function (event) {
        log(event.type, event.data);
    };
        
    return function (sandbox) {
        sandbox.bind('newData', printLog);
        sandbox.bind('ready', printLog);
    };
}