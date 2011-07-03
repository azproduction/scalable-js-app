(function(global){
    "use strict";
    var $box;
        
    var Module1 = {
        init: function (sandbox) {
            $box = sandbox.getBox();
            sandbox.bind('newData', function (_, data) {
                $box.text(sandbox.getText("text_label") + data);
            });
        },
        destroy: function () {
        
        }
    };
    
    if (!global) {
        return Module1;
    }
    if (!global.exports) {
        global.exports = {};
    }
    global.exports.Module1 = Module1;
}(this))