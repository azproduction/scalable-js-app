function MessageView(sandboxed, exports, module) {
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

    return {
        init: function (sandbox) {
            messageViewInstance = new MessageView(sandbox);
        },
        destroy: function () {
            messageViewInstance = null;
        }
    };
}