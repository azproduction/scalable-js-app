function DataGenerator(sandboxed, exports, module) {
    "use strict";
    var intervalId;

    return function (sandbox) {
        if (intervalId) {
            return; // 1 instance only
        }
        intervalId = setInterval(function () {
            sandbox.trigger('newData', Math.random());
        }, sandbox.getResource('interval'));

        sandbox.bind('destroy', function () {
            clearInterval(intervalId);
        });
    };
}