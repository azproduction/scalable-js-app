/**
 *
 * @see articles:
 * 
 * Andrew Dupont (Gowalla, Prototype.js, S2)
 * 1. Maintainable JavaScript
 *    http://channel9.msdn.com/Events/MIX/MIX11/EXT23
 *
 * Nicholas Zakas (Yahoo!, YUI, YUI Test)
 * 2. Writing Maintainable JavaScript
 *    http://www.yuiblog.com/blog/2007/05/25/video-zakas/
 * Slides:
 *    New: http://www.slideshare.net/nzakas/maintainable-javascript-2011
 *    Old: http://www.slideshare.net/nzakas/maintainable-javascript-1071179
 *
 * 3. Scalable JavaScript Application Architecture
 *    http://developer.yahoo.com/yui/theater/video.php?v=zakas-architecture
 */

/*$require: ./lib/Core.js */

(function (Core) {
    "use strict";

/*$buildFrom ./index.json */

// + descriptors/Logger.json
Core.pushDescriptor("Logger", {
    "name": "Logger",
    "acl": {
        "listen:newData": true,
        "listen:ready": true
    }
});
// - descriptors/Logger.json

// + modules/Logger.js
Core.pushModule("Logger", (function(global){
    "use strict";
    var printLog = function (event, data) {
        console.log(event.type, data);
    };

    var Logger = {
        init: function (sandbox) {
            sandbox.bind('newData', printLog);
            sandbox.bind('ready', printLog);
        },
        destroy: function () {}
    };

    if (!global) {
        return Logger;
    }
    if (!global.exports) {
        global.exports = {};
    }
    global.exports.Logger = Logger;
}(this)));
// - modules/Logger.js

// + locales/Logger.js
Core.pushLocale("Logger", {});
// - locales/Logger.js

    Core.on('ready', function () {
        Core.trigger('newData', 'Pewpew');
    });

    Core.init(/*$require*/'./index.json'/*$*/);
}(this.exports.Core))