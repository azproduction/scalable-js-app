function EventManagerTest (require) {
    var ok = require('ok'),
        equal = require('equal'),
        test = require('test'),
        expect = require('expect'),
        module = require('module'),
        raises = require('raises');

    var EventManager = require('EventManager');

    module('EventManager');

    test("basic test", function() {
        expect(3);

        var data = {data: 'data'};
        var namespace = 'mytestnamespace';
        var listenterThatShouldFire = function (event) {
            ok(true, "event fired");
            equal(data, event.data, 'should pass data');
            equal('event1', event.type, 'should pass event name');
        };

        var listenterThatShouldndFire = function () {
            ok(false, "event shouldnt fire");
        };

        // EventManager.bind
        // EventManager.trigger
        EventManager.bind('event1', listenterThatShouldFire);
        EventManager.trigger('event1', data); // +2
        EventManager.unbind('event1', listenterThatShouldFire);

        //
        EventManager.bind('event2', listenterThatShouldndFire);
        EventManager.bind('event2', listenterThatShouldndFire, namespace);


        // EventManager.unbind
        EventManager.unbind('event2', namespace);
        EventManager.unbind('event2', listenterThatShouldndFire);
        EventManager.trigger('event2'); // 0

        // EventManager.unbind
        EventManager.unbind('event1', listenterThatShouldFire);
        EventManager.unbind('event1', namespace);
        EventManager.trigger('event1', {}); // 0
        EventManager.trigger('event2', {}); // 0


    });

    test("bind test", function() {
        expect(7);

        var listenter = function (event) {
            ok(event.data.ok, "event fired");
        };

        var listenterThatShouldndFire = function (event) {
            ok(false, "event fired");
        };

        EventManager.bind('  event1 event2 event2   ', listenter);
        EventManager.bind('event1', listenter);
        EventManager.bind('event1', listenter, "namespace");
        EventManager.trigger('event1 event2', {ok: true}); // 5

        EventManager.bind('event1', listenterThatShouldndFire, "namespace");
        EventManager.unbind('event1', "namespace"); // should unbind listenterThatShouldndFire and listenter
        EventManager.trigger('event1', {ok: true}); // 2

        EventManager.unbind('event1 event2');

        EventManager.trigger('event1 event2', {ok: false}); // 0
    });

    test("bind namespace test", function() {
        expect(20);

        var listenter = function (event) {
            ok(event.data.ok, "event fired");
        };

        var listenterThatShouldndFire = function (event) {
            ok(false, "event fired");
        };

        EventManager.bind('event1', listenterThatShouldndFire, "namespace");
        EventManager.bind('event2', listenterThatShouldndFire, "namespace");
        EventManager.bind('event3', listenterThatShouldndFire, "namespace");

        EventManager.unbindAllNs("namespace");

        EventManager.trigger('event1 event2 event3', {ok: false}); // 0

        EventManager.bind('event1', listenter);
        EventManager.bind('event1', listenter);
        EventManager.bind('event1', listenter);
        EventManager.bind('event1', listenter, "namespace");
        EventManager.bind('event1', listenter, "namespace");
        EventManager.bind('event1', listenter, "namespace");
        EventManager.bind('event1', listenter, "namespace2");

        EventManager.trigger('event1', {ok: true}); // 7

        EventManager.unbind('event1', listenter);
        EventManager.trigger('event1', {ok: true}); // 6

        EventManager.unbind('event1');
        EventManager.trigger('event1', {ok: true}); // 4

        EventManager.unbind('event1', listenter, "namespace");
        EventManager.trigger('event1', {ok: true}); // 3

        EventManager.unbind('event1', "namespace");
        EventManager.unbind('event1', "namespace2");

        EventManager.trigger('event1', {ok: false}); // 0
    });

    test("trigger test", function() {
        expect(2);
        EventManager.bind('event1', function () {
            throw new Error("Some error text");
        });

        EventManager.bind('event1', function () {
            ok(true, "event should fire after error");
        });

        raises(function () {
            EventManager.trigger('event1', {});
        }, "shouldnt catch error");

        EventManager.trigger('event1', {}, true); // 1 safe trigger

        EventManager.unbind('event1'); // cleanup
    });
}