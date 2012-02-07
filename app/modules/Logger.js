function Logger(sandboxed, exports, module) {
    "use strict";
    var printLog = function (event, data) {
        console.log(event.type, data);
    };
        
    return {
        init: function (sandbox) {
            sandbox.bind('newData', printLog);
            sandbox.bind('ready', printLog);
        },
        destroy: function () {}
    };
}