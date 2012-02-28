function EventManagerTest (require) {
    var ok = require('ok'),
        equal = require('equal'),
        test = require('test'),
        expect = require('expect'),
        module = require('module');

    var EventManager = require('EventManager');

    module('EventManager');

    test("EventManager test", function() {
        expect(2);

        var data = {data: 'data'};
        var namespace = 'mytestnamespace';
        var listenterThatShouldFire = function (event, incomeData) {
            ok(true, "event fired");
            equal(data, incomeData, 'should pass data');
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
        EventManager.bind('event2.' + namespace, listenterThatShouldndFire);


        // EventManager.unbind
        EventManager.unbind('event2.' + namespace);
        EventManager.unbind('event2', listenterThatShouldndFire);
        EventManager.trigger('event2'); // 0

        // EventManager.unbind
        EventManager.unbind('event1', listenterThatShouldFire);
        EventManager.unbind('event1.' + namespace);
        EventManager.trigger('event1', {}); // 0
        EventManager.trigger('event2', {}); // 0


    });
}