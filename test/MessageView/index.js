// MessageView test
(function (Core, $, TestData, ok, test, module, equals, expect, asyncTest, start, stop) {
"use strict";

var MessageViewDescriptor = {
    "name": "MessageView",
    "acl": {
        "trigger:newData:display": true,
        "listen:newData": true
    },
    "resources": {}
};

var MessageViewLocale = {
    "text_label": {
        "ru": "Он сказал: ",
        "en": "He said: "
    }
};

var ApplicationEnvironment = {
    "modules": ["MessageView"],
    "layout": {
        "MessageView": ".b-message-view"
    },
    "locale": "ru",
    "path": {
        "descriptor": "../../app/descriptors/",
        "module": "../../app/modules/",
        "locale": "../../app/locales/"
    }
};

Core.pushDescriptor("MessageView", MessageViewDescriptor);
Core.pushLocale("MessageView", MessageViewLocale);

Core.on('ready', function () {
    module("MessageView");

    test("listen:newData", function() {
        var testItems = TestData["newData"](),
            $MessageView = $(ApplicationEnvironment.layout.MessageView),
            label = MessageViewLocale.text_label[ApplicationEnvironment.locale];

        expect(testItems.length);

        // >>> put your code

        $.each(testItems, function (index, item) {
            Core.trigger("newData", [item]);

            // >>> put your code
            equals(label + item, $MessageView.text(), 'Should be "text_label: value"');
        });
    });

    test("trigger:newData:display", function() {
        var testItems = TestData["newData"](),
            $MessageView = $(ApplicationEnvironment.layout.MessageView);

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