(function(global){
    "use strict";
    var sb;

    var Hook = {
        init: function (sandbox) {
            sb = sandbox;
            sandbox.hook('newData', function (data) {
                if (typeof data === "string") {
                    return false;
                }
                if (data < 0.5) {
                    data = data * 100;
                }
                return data;
            });
        },
        destroy: function () {
            sb.unhook('newData');    
        }
    };
    
    if (!global) {
        return Hook;
    }
    if (!global.exports) {
        global.exports = {};
    }
    global.exports.Hook = Hook;
}(this))