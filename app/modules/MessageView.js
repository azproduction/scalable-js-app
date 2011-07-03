(function(global){
    "use strict";
    var $box;
        
    var MessageView = {
        init: function (sandbox) {
            $box = sandbox.getBox();
            sandbox.bind('newData', function (_, data) {
                $box.text(sandbox.getText("text_label") + data);
                sandbox.trigger('newData:display');
            });
        },
        destroy: function () {
        
        }
    };
    
    if (!global) {
        return MessageView;
    }
    if (!global.exports) {
        global.exports = {};
    }
    global.exports.MessageView = MessageView;
}(this))