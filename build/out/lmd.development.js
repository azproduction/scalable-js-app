(function (window, sandboxed_modules) {
    var modules = {},
        initialized_modules = {},
        require = function (moduleName) {
            var module = modules[moduleName],
                output;

            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }

            // Lazy LMD module
            if (typeof module === "string") {
                module = (0, window.eval)(module);
            }

            // Predefine in case of recursive require
            output = {exports: {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                module = window[moduleName];
            } else if (typeof module === "function") {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                module = module(sandboxed_modules[moduleName] ? null : require, output.exports, output) || output.exports;
            }

            return modules[moduleName] = module;
        },
        lmd = function (misc) {
            var output = {exports: {}};
            switch (typeof misc) {
                case "function":
                    misc(require, output.exports, output);
                    break;
                case "object":
                    for (var moduleName in misc) {
                        // reset module init flag in case of overwriting
                        initialized_modules[moduleName] = 0;
                        modules[moduleName] = misc[moduleName];
                    }
                    break;
            }
            return lmd;
        };
    return lmd;
})(window,{"MessageView":true,"DataGenerator":true,"Logger":true})({
"Core": function Core(require, exports) {
    "use strict";

    var $ = require('$'),
        templateFactory = require('Template'),
        Sandbox = require('Sandbox'),
        EventManager = require('EventManager');

    var bind = function (func, context) {
        return function () {
            return func.apply(context, arguments);
        };
    };

    /**
     * @namespace
     */
    var Core = {
        /**
         * Application descriptor
         *
         * @type Object
         */
        descriptor: {},

        /**
         * Modules descriptors
         *
         * @type Object
         */
        descriptors: {},

        /**
         * Modules locales
         *
         * @type Object
         */
        locales: {},

        /**
         * Modules templates
         *
         * @type Object
         */
        templates: {},

        /**
         * @type Object
         */
        runningModules: {},

        /**
         * Starts app
         *
         * @params {Object} [data]
         *
         * @returns Core
         */
        init: function (data) {
            data = data || {};
            this.descriptor = data.descriptor || require('descriptor');
            this.descriptor.modules = this.descriptor.modules || [];
            this.descriptor.layout = this.descriptor.layout || {};
            this.descriptors = data.descriptors || require('descriptors');
            this.templates = data.templates || require('templates');
            this.locales = data.locales || require('locales');

            this._initModules();

            return this;
        },

        /**
         * @private
         */
        _initModules: function () {
            // Load all
            for (var i = 0, c = this.descriptor.modules.length; i < c; i++) {
                this.initModule(this.descriptor.modules[i]);
            }
        },

        /**
         * Public version of _initModules
         *
         * @param {String}   name
         *
         * @returns Core
         */
        initModule: function (name) {
            if (this.runningModules[name]) {
                return this;
            }
            var sandbox = new Sandbox(this.descriptors[name]);
            this.runningModules[name] = require(name);
            this.runningModules[name].init(sandbox);

            return this;
        },

        /**
         * Destroys module
         *
         * @param {String} name
         *
         * @returns Core
         */
        destroyModule: function (name) {
            if (this.runningModules[name]) {
                this.runningModules[name].destroy();
                
                // Cleanup
                EventManager.unbind('.' + name);
                this.getBox().html('');
                delete this.runningModules[name];
            }
            return this;
        },

        /**
         * Get modules box if exists
         *
         * @param {String} name
         *
         * @returns {HTMLElement|undefined}
         */
        getBox: function (name) {
            return ($(this.descriptor.layout[name]));
        },

        /**
         * Gets module template
         *
         * @param {String} moduleName
         * @param {String} templateSelector
         *
         * @returns {Function|undefined}
         */
        getTemplate: function (moduleName, templateSelector) {
            if (typeof this.templates[moduleName] === "string") {
                // wrap all templates
                this.templates[moduleName] = $('<div/>').html(this.templates[moduleName]);
            }
            return templateFactory(this.templates[moduleName].find(templateSelector).html());
        },

        /**
         * gets locale string
         *
         * @param {String} moduleName
         * @param {String} message
         *
         * @returns {String}
         */
        getText: function (moduleName, message) {
            var locale = this.locales[moduleName][message];
            return (typeof locale === "object" ? locale[this.descriptor.locale] : locale) || message;
        }
    };

// ---------------------------------------------------------------------------------------------------------------------

    /**
     * Global Core object
     */
    var coreExports = {
        trigger:       bind(EventManager.trigger, EventManager),
        bind:          bind(EventManager.bind, EventManager),
        unbind:        bind(EventManager.unbind, EventManager),
        on:            bind(EventManager.bind, EventManager),

        init:          bind(Core.init, Core),
        destroyModule: bind(Core.destroyModule, Core),
        initModule:    bind(Core.initModule, Core),
        getTemplate:   bind(Core.getTemplate, Core),
        getText:       bind(Core.getText, Core),
        getBox:        bind(Core.getBox, Core)
    };

    // exports
    for (var i in coreExports) {
        exports[i] = coreExports[i];
    }
},
"Template": function Template() {
    /**
     * Simple JavaScript Templating
     * John Resig - http://ejohn.org/ - MIT Licensed
     *
     * @param {String} str  template string
     * @param {Object} [data] template data
     *
     * @returns {Function|String} template or string
     */
    return function (str, data) {
        var fn =  new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj||{}){p.push('" +

        // Convert the template into pure JavaScript
        String(str)
        .replace(/[\r\t\n]/g, " ")
        .split("{%").join("\t")
        .replace(/((^|%})[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)%}/g, "',$1,'")
        .split("\t").join("');")
        .split("%}").join("p.push('")
        .split("\r").join("\\'")
        + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    };
},
"EventManager": function EventManager(require) {
    var $ = require('$');

    /**
    * @namespace
    */
    return {
        /**
        * @type jQuery
        */
        $: $('<div/>'),
        /**
        * Hooked version of jQuery#trigger
        *
        * @param {String} event
        * @param {Array}  data
        *
        * @returns {EventManager}
        */
        trigger: function (event, data) {
            this.$.trigger.apply(this.$, [event, data]);
            return this;
        },
        /**
        * Remap of jQuery#bind
        *
        * @see jQuery#bind
        *
        * @returns {EventManager}
        */
        bind: function () {
            this.$.bind.apply(this.$, arguments);
            return this;
        },
        /**
        * Remap of jQuery#bind
        *
        * @see jQuery#unbind
        *
        * @returns {EventManager}
        */
        unbind: function () {
            this.$.unbind.apply(this.$, arguments);
            return this;
        }
    };
},
"Sandbox": function Sandbox(require) {
    var Core = require('Core'),
        EventManager = require('EventManager');

    /**
     * @constructor
     * @param {Object} descriptor
     */
    var Sandbox = function (descriptor) {
        this.descriptor = descriptor || {};
    };

    /**
     * Gets module box
     *
     * @returns {HTMLElement|undefined}
     */
    Sandbox.prototype.getBox = function () {
        return Core.getBox(this.descriptor.name);
    };

    /**
     * Checks if module allowed to...
     *
     * @param {String} role...
     *
     * @returns {Boolean}
     */
    Sandbox.prototype.is = function () {
        var acl = this.descriptor.acl;

        if (acl['*']) {
            return true;
        }

        for (var i = 0, c = arguments.length, role; i < c; i++) {
            role = arguments[i];
            if (!(acl[role] || acl[role.split(':')[0] + ':*'])) {
                return false;
            }
        }

        return true;
    };

    /**
     * Binds to specific event
     *
     * @param {String}   event
     * @param {Function} callback
     *
     * @returns {Sandbox}
     */
    Sandbox.prototype.bind = function (event, callback) {
        if (this.is('listen:' + event)) {
            // Adds module name as namespace
            EventManager.bind(event + '.' + this.descriptor.name, callback);
        }

        return this;
    };

    /**
     * Unbinds specific event
     *
     * @param {String}   event
     * @param {Function} callback
     *
     * @returns {Sandbox}
     */
    Sandbox.prototype.unbind = function (event, callback) {
        if (this.is('listen:' + event)) {
            // Adds module name as namespace
            EventManager.unbind(event + '.' + this.descriptor.name, callback);
        }

        return this;
    };

    /**
     * Triggers specific event
     *
     * @param {String} event
     * @param {Mixed}  data
     *
     * @returns {Sandbox}
     */
    Sandbox.prototype.trigger = function (event, data) {
        if (this.is('trigger:' + event)) {
            EventManager.trigger(event, data);
        }

        return this;
    };

    /**
     * gets locale string
     *
     * @param {String} message
     *
     * @returns {String}
     */
    Sandbox.prototype.getText = function (message) {
        return Core.getText(this.descriptor.name, message);
    };

    /**
     * gets module resource
     *
     * @param {String} resource
     *
     * @returns {Mixed}
     */
    Sandbox.prototype.getResource = function (resource) {
        return this.descriptor.resources[resource];
    };

    /**
     * gets module template
     *
     * @param {String} templateSelector
     *
     * @returns {Function|undefined}
     */
    Sandbox.prototype.getTemplate = function (templateSelector) {
        return Core.getTemplate(this.descriptor.name, templateSelector);
    };

    // exports
    return Sandbox;
},
"locales": {"MessageView":{"text_label":{"ru":"Он сказал: ","en":"He said: "}},"DataGenerator":{},"Logger":{}},
"templates": {"MessageView":"<div class=\"b-message-view\">\r\n    <span class=\"b-message-view__label\">{%=label%}</span><span class=\"b-message-view__value\">{%=value%}</span>\r\n</div>"},
"descriptors": {"MessageView":{"name":"MessageView","acl":{"trigger:newData:display":true,"listen:newData":true},"resources":{}},"DataGenerator":{"name":"DataGenerator","acl":{"trigger:newData":true},"resources":{"interval":1000}},"Logger":{"name":"Logger","acl":{"listen:newData":true,"listen:ready":true},"resources":{}}},
"descriptor": {
    "modules": ["MessageView", "DataGenerator", "Logger"],
    "layout": {
        "MessageView": ".b-message-view"
    },
    "locale": "ru",
    "path": {
        "descriptor": "./app/descriptors/",
        "module": "./app/modules/",
        "locale": "./app/locales/",
        "template": "./app/templates/"
    }
},
"MessageView": function MessageView(sandboxed, exports, module) {
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
},
"DataGenerator": function DataGenerator(sandboxed, exports, module) {
    "use strict";
    var intervalId;
        
    return {
        init: function (sandbox) {
            intervalId = setInterval(function () {
                sandbox.trigger('newData', Math.random());
            }, sandbox.getResource('interval'));
        },
        destroy: function () {
            clearInterval(intervalId);    
        }
    };
},
"Logger": function Logger(sandboxed, exports, module) {
    "use strict";
    var printLog = function (event, data) {
        console.log(event.type, data);
    };
        
    return {
        init: function (sandbox) {
            sandbox.bind('newData', printLog);
            sandbox.bind('ready', printLog);
        },
        destroy: function () {}
    };
}
})(/**
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

function main(require, exports, module) {
    "use strict";
    require('Core').init();
})