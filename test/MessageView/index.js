// MessageView test
(function (Core, $, TestData, ok, test, module, equals, expect, asyncTest, start, stop) {
"use strict";

var ApplicationEnvironment =
{
    "modules": ["MessageView"],
    "layout": {
        "MessageView": ".b-message-view"
    },
    "locale": "ru",
    "path": {
        "descriptor": "../../app/descriptors/",
        "module": "../../app/modules/",
        "locale": "../../app/locales/",
        "template": "../../app/templates/"
    }
};

Core.on('ready', function () {
    module("MessageView");

    test("listen:newData", function() {
        var testItems = TestData["newData"](),
            $MessageView = Core.getBox("MessageView"),
            template = Core.getTemplateFunction("MessageView", '.b-message-view'),
            label = Core.getText("MessageView", "text_label");

        expect(testItems.length);

        // >>> put your code

        $.each(testItems, function (index, text) {
            Core.trigger("newData", [text]);

            // >>> put your code
            var expected = template({label: label, value: text});
            equals(expected, $MessageView.html(), 'Should be "text_label: value"');
        });
    });

    test("trigger:newData:display", function() {
        var testItems = TestData["newData"](),
            $MessageView = Core.getBox("MessageView"),
            template = Core.getTemplateFunction("MessageView", '.b-message-view');

        expect(testItems.length);

        // >>> put your code
        Core.on("newData:display", function () {
            ok(true);
        });

        $.each(testItems, function (index, item) {
            Core.trigger("newData", [item]);
            // >>> put your code
        });
    });

});

Core.init(ApplicationEnvironment);

}(this.exports.Core, jQuery, TestData, ok, test, module, equals, expect, asyncTest, start, stop))