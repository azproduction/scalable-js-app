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
})(window,{})({
"CoreTest": function CoreTest (require) {
    var ok = require('ok'),
        equal = require('equal'),
        test = require('test'),
        expect = require('expect'),
        module = require('module');

    module('Core');

    test("Core test", function() {
        ok(false, "implement");
    });
},
"EventManagerTest": function EventManagerTest (require) {
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

    test("one namespace trigger test", function() {
        expect(1);

        EventManager.bind('event1', function () {
            ok(true, "event should fire");
        }, 'namespace');

        EventManager.bind('event1', function () {
            ok(false, "event shouldnt fire");
        }, 'namespace2');

        EventManager.trigger('event1', {}, false, 'namespace'); // 1

        EventManager.unbind('event1'); // cleanup
    });
},
"SandboxTest": function SandboxTest (require) {
    var ok = require('ok'),
        equal = require('equal'),
        test = require('test'),
        expect = require('expect'),
        module = require('module');

    module('Sandbox');

    test("Sandbox test", function() {
        ok(false, "implement");
    });
},
"TemplateTest": function TemplateTest (require) {
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
},
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
            this.sandboxes[name] = sandbox;

            new require(name)(sandbox);

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
}
})(function main (require) {
    var $ = require('$');

    $(function () {
        require('TemplateTest');
        require('EventManagerTest');
        require('SandboxTest');
        require('CoreTest');

        /*test("a basic test example", function() {
            ok( true, "this test is fine" );
            var value = "hello";
            equal( value, "hello", "We expect value to be hello" );
        });

        module("Module A");

        test("first test within module", function() {
            ok( true, "all pass" );
        });

        test("second test within module", function() {
            ok( true, "all pass" );
        });

        module("Module B");

        test("some other test", function() {
            expect(2);
            equal( true, false, "failing test" );
            equal( true, true, "passing test" );
        });*/
    });
})