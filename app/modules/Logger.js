(function(global){
    "use strict";
    var printLog = function (event, data) {
        console.log(event.type, data);
    };
        
    var Logger = {
        init: function (sandbox) {
            sandbox.bind('newData', printLog);
            sandbox.bind('ready', printLog);
        },
        destroy: function () {}
    };
    
    if (!global) {
        return Logger;
    }
    if (!global.exports) {
        global.exports = {};
    }
    global.exports.Logger = Logger;
}(this))