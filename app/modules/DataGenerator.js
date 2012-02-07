function DataGenerator(sandboxed, exports, module) {
    "use strict";
    var intervalId;
        
    return {
        init: function (sandbox) {
            intervalId = setInterval(function () {
                sandbox.trigger('newData', Math.random());
            }, sandbox.getResource('interval'));
        },
        destroy: function () {
            clearInterval(intervalId);    
        }
    };
}