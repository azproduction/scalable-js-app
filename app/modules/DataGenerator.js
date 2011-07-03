(function(global){
    "use strict";
    var intervalId;
        
    var DataGenerator = {
        init: function (sandbox) {
            intervalId = setInterval(function () {
                sandbox.trigger('newData', Math.random());
            }, sandbox.getResource('interval'));
        },
        destroy: function () {
            clearInterval(intervalId);    
        }
    };
    
    if (!global) {
        return DataGenerator;
    }
    if (!global.exports) {
        global.exports = {};
    }
    global.exports.DataGenerator = DataGenerator;
}(this))