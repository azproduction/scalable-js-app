(function(global){
    "use strict";
    var messageViewInstance;

    var MessageView = function (sandbox) {
        var self = this;
        this.sandbox = sandbox;
        this.template = sandbox.getTemplate(".b-message-view");
        this.label = sandbox.getText("text_label");
        this.$box = sandbox.getBox();

        sandbox.bind('newData', function (_, text) {
            self.update(text);
        });
    };

    MessageView.prototype.update = function (text) {
        var html = this.template({
            label: this.label,
            value: text
        });
        this.$box.html(html);
        this.sandbox.trigger('newData:display');
    };

    var MessageViewPublic = {
        init: function (sandbox) {
            messageViewInstance = new MessageView(sandbox);
        },
        destroy: function () {
            messageViewInstance = null;
        }
    };
    
    if (!global) {
        return MessageViewPublic;
    }
    if (!global.exports) {
        global.exports = {};
    }
    global.exports.MessageView = MessageViewPublic;
}(this))