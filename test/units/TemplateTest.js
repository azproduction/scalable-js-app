function TemplateTest (require) {
    var ok = require('ok'),
        equal = require('equal'),
        test = require('test'),
        expect = require('expect'),
        module = require('module'),
        raises = require('raises'),

        templateFactory = require('Template');

    var templateResult,
        template = '<div>{%=a%}</div>',
        emptyTemplate = '<div></div>';

    module('Template');

    test("basic test", function() {
        templateResult = templateFactory(template);
        ok(typeof templateResult === "function", "template factory should return a function if only template passed");
        equal("<div>123</div>", templateResult({a: 123}), "should work multiply times");
        equal("<div>123</div>", templateResult({a: 123, b: 123}), "should ignore extraparams");

        equal("<div></div>", templateFactory(emptyTemplate)(), "template should work and return a string if no data passed");

        ok(typeof templateFactory(template, {a: 1}) === "string", "template factory should return a string if template and data passed");

        equal(templateFactory(emptyTemplate)(), templateFactory(emptyTemplate, 1), "sould be the same");
        equal(templateFactory(template)({a: 123}), templateFactory(template, {a: 123}), "sould be the same");

        raises(function () {
            templateFactory(template)();
        }, "Should throw an error if in-template variable is not passed to data object")
    });
}