(function(global){
    "use strict";
    var intervalId;
        
    var Module2 = {
        init: function (sandbox) {
            intervalId = setInterval(function () {
                sandbox.trigger('newData', Math.random());
            }, 1000);
        },
        destroy: function () {
            clearInterval(intervalId);    
        }
    };
    
    if (!global) {
        return Module2;
    }
    if (!global.exports) {
        global.exports = {};
    }
    global.exports.Module2 = Module2;
}(this))