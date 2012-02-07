function Hook(sandboxed, exports, module) {
    "use strict";
    var sb;

    return {
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
}