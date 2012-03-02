function MessageView(sandboxed, exports, module) {
    "use strict";

    var MessageView = function (sandbox) {
        var self = this;
        this.sandbox = sandbox;
        this.template = sandbox.getTemplate("b-message-view");
        this.label = sandbox.getText("text_label");
        this.parentElement = sandbox.getBox();

        sandbox.bind('newData', function (event) {
            self.update(event.data);
        });
    };

    MessageView.prototype.update = function (text) {
        this.parentElement.innerHTML = this.template({
            label: this.label,
            value: text
        });
        this.sandbox.trigger('newData:display');
    };

    return MessageView;
}