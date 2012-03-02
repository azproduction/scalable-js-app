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
})(window,{"MessageView":true,"DataGenerator":true})({
"Core": function Core(require, exports) {
    "use strict";

    var templateFactory = require('Template'),
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
        sandboxes: {},

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
            if (this.sandboxes[name]) {
                return this;
            }
            var sandbox = new Sandbox(this.descriptors[name]);
            var module = require(name);
            this.sandboxes[name] = sandbox;

            new module(sandbox);

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
            var sandbox = this.sandboxes[name];
            if (sandbox) {
                EventManager.trigger('destroy', null, true, sandbox.namespace);
                
                // Cleanup
                EventManager.unbindAllNs(sandbox.namespace);
                var box = this.getBox();
                if (box) {
                    box.innerHTML = '';
                }
                delete this.sandboxes[name];
            }
            return this;
        },

        /**
         * Get modules box if exists
         *
         * @param {String} name
         *
         * @returns {HTMLElement|null}
         */
        getBox: function (name) {
            var elementId = this.descriptor.layout[name];
            if (elementId) {
                return document.getElementById(elementId);
            }
            return null;
        },

        /**
         * Gets module template
         *
         * @param {String} moduleName
         * @param {String} templateId
         *
         * @returns {Function|undefined}
         */
        getTemplate: function (moduleName, templateId) {
            if (typeof this.templates[moduleName] === "string") {
                // wrap all templates
                var div = document.createElement('div');
                div.innerHTML = this.templates[moduleName];
                this.templates[moduleName] = div;
            }
            var templateElement = this._getElementById(this.templates[moduleName], templateId);
            return templateFactory(templateElement ? templateElement.innerHTML : '');
        },

        /**
         * polyfill
         */
        _getElementById: function (element, elementId) {
            if (element.querySelector) { // modern browser
                return element.querySelector('#' + elementId);
            }

            var nodes = element.childNodes;
            for (var i = 0, c = nodes.length; i < c; i++) {
                if (nodes[i].getAttribute) { // its element
                    if (nodes[i].getAttribute('id') === elementId) {
                        return nodes[i];
                    } else {
                        return this._getElementById(nodes[i], elementId);
                    }
                }
            }
            return null;
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
        unbindAllNs:   bind(EventManager.unbindAllNs, EventManager),

        init:          bind(Core.init, Core),
        destroyModule: bind(Core.destroyModule, Core),
        initModule:    bind(Core.initModule, Core),
        getTemplate:   bind(Core.getTemplate, Core),
        getText:       bind(Core.getText, Core),
        getBox:        bind(Core.getBox, Core)
    };

    // aliases
    coreExports.on = coreExports.bind;
    coreExports.off = coreExports.unbind;

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

    /**
    * @namespace
    */
    return {
        /**
         * @type {Object}
         *
         * @format
         *
         * {
         *     "eventName": {
         *         "namespace": [function, ...],
         *         ...
         *     },
         *     ...
         * }
         */
        eventsNs: {},

        /**
         *
         * @param {String} eventName
         * @param {String} [eventNamespace]
         *
         * @returns {Array|Object}
         */
        _getEventListNs: function (eventName, eventNamespace) {
            var self = this;
            if (!self.eventsNs[eventName]) {
                self.eventsNs[eventName] = {};
            }

            if (eventNamespace) {
                if (!self.eventsNs[eventName][eventNamespace]) {
                    self.eventsNs[eventName][eventNamespace] = [];
                }
                return self.eventsNs[eventName][eventNamespace];
            } else {
                return self.eventsNs[eventName];
            }
        },

        /**
         *
         * @param {String} events
         *
         * @returnts {String[]}
         */
        _parseEventsString: function (events) {
            var eventList = events.split(' '),
                result = [];

            // filter empty strings
            for (var i = 0, c = eventList.length; i < c; i++) {
                if (eventList[i]) {
                    result.push(eventList[i]);
                }
            }

            return result;
        },

        /**
         * @param {String}  events          event string list
         * @param {Array}   data            event data
         * @param {Boolean} [is_safe=false] do catch callback errors
         * @param {String}  ns              trigger for that namespace only
         *
         * @returns {EventManager}
         */
        trigger: function (events, data, is_safe, ns) {
            if (typeof events === "string") {
                events = this._parseEventsString(events);

                // loop events
                for (var i = 0, c = events.length, eventListNs, eventList, eventName; i < c; i++) {
                    eventName = events[i];
                    eventListNs = this._getEventListNs(eventName); // {"namespace": [listOfCallbacks, ...], ...}
                    // loop namespaces
                    for (var namespace in eventListNs) {
                        if (ns && ns !== namespace) {
                            continue;
                        }
                        if (eventListNs.hasOwnProperty(namespace)) {
                            eventList = eventListNs[namespace]; // [listOfCallbacks, ...]
                            // loop callbacks
                            for (var j = 0, c1 = eventList.length, event; j < c1; j++) {
                                event = {type: events[i], data: data};
                                // dont catch error
                                if (is_safe) {
                                    try {
                                        eventList[j](event);
                                    } catch (e) {}
                                } else {
                                    eventList[j](event);
                                }
                            }
                        }
                    }
                }
            }
            return this;
        },

        /**
         *
         * @param {String}   events
         * @param {Function} callback
         * @param {String}   [namespace="*"]
         *
         * bind(events, callback) bind callback to event of namespace '*'
         * bind(events, callback, namespace) bind callback to event of namespace
         *
         * @returns {EventManager}
         */
        bind: function (events, callback, namespace) {
            if (typeof events === "string" && typeof callback === "function") {
                namespace = namespace || '*';
                events = this._parseEventsString(events);

                for (var i = 0, c = events.length; i < c; i++) {
                    this._getEventListNs(events[i], namespace).push(callback);
                }
            }
            return this;
        },

        /**
         *
         * @param {String}          events          events
         * @param {Function|String} [callback]      callback or namespace
         * @param {String}          [namespace="*"] namespace or undefined
         *
         * @example
         * unbind(event) wipe all callbcaks of namespace '*'
         * unbind(event, function) remove one callback of event of namespace '*'
         * unbind(event, namespace) wipe all callbacks of event of namespace
         * unbind(event, function, namespace) remove one callback of event of namespace
         *
         * @returns {EventManager}
         */
        unbind: function (events, callback, namespace) {
            if (typeof events === "string") {
                if (typeof callback === "string" && typeof namespace === "undefined") {
                    namespace = callback;
                    callback = void 0;
                }
                namespace = namespace || '*';
                events = this._parseEventsString(events);
                for (var i = 0, c = events.length, eventList, callbackIndex; i < c; i++) {
                    eventList = this._getEventListNs(events[i], namespace);
                    if (callback) {
                        callbackIndex = eventList.indexOf(callback);
                        if (callbackIndex !== -1) {
                            eventList.splice(callbackIndex, 1);
                        }
                    } else {
                        eventList.splice(0); // wipe
                    }
                }
            }
            return this;
        },

        /**
         * Unbinds all events of selected namespace
         *
         * @param {String} namespace
         *
         * @returns {EventManager}
         */
        unbindAllNs: function (namespace) {
            var eventListNs;
            for (var eventName in this.eventsNs) {
                if (this.eventsNs.hasOwnProperty(eventName)) {
                    eventListNs = this.eventsNs[eventName];
                    if (eventListNs[namespace]) {
                        eventListNs[namespace] = [];
                    }
                }
            }
            return this;
        }
    };
},
"Sandbox": function Sandbox(require) {
    var Core = require('Core'),
        EventManager = require('EventManager');

    var uuid = 0;

    /**
     * @constructor
     * @param {Object} descriptor
     */
    var Sandbox = function (descriptor) {
        this.descriptor = descriptor || {};
        this.namespace = this.descriptor.name + ++uuid;
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
            EventManager.bind(event, callback, this.namespace);
        }

        return this;
    };

    /**
     * Unbinds specific event
     *
     * @param {String}   event
     * @param {Function} [callback]
     *
     * @returns {Sandbox}
     */
    Sandbox.prototype.unbind = function (event, callback) {
        if (this.is('listen:' + event)) {
            // Adds module name as namespace
            EventManager.unbind(event, callback, this.namespace);
        }

        return this;
    };

    /**
     * Triggers specific event
     *
     * @param {String} event
     * @param          data
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
"templates": {"MessageView":"<div class=\"b-message-view\" id=\"b-message-view\">\r\n    <span class=\"b-message-view__label\">{%=label%}</span><span class=\"b-message-view__value\">{%=value%}</span>\r\n</div>"},
"descriptors": {"MessageView":{"name":"MessageView","acl":{"trigger:newData:display":true,"listen:newData":true},"resources":{}},"DataGenerator":{"name":"DataGenerator","acl":{"trigger:newData":true,"listen:destroy":true},"resources":{"interval":1000}},"Logger":{"name":"Logger","acl":{"listen:newData":true,"listen:ready":true},"resources":{}}},
"descriptor": {
    "modules": ["MessageView", "DataGenerator", "Logger"],
    "safe_modules": ["Logger"],
    "layout": {
        "MessageView": "b-message-view"
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
},
"DataGenerator": function DataGenerator(sandboxed, exports, module) {
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
},
"Logger": function Logger(require, exports, module) {
    // this modules is safe - can include orther modules
    var log = require('console').log;

    "use strict";
    var printLog = function (event) {
        log(event.type, event.data);
    };
        
    return function (sandbox) {
        sandbox.bind('newData', printLog);
        sandbox.bind('ready', printLog);
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