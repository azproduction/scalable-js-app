/*$require: http://yandex.st/jquery/1.6.1/jquery.js ./vendors/Script.js */

/*global jQuery: false, $script: false */
(function(global, $, require, undefined){
    "use strict";

    /**
     * Simple JavaScript Templating
     * John Resig - http://ejohn.org/ - MIT Licensed
     *
     * template for flash plugin
     *
     * @param {String} str  template string
     * @param {Object} [data] template data
     *
     * @returns {Function|String} template or string
     */
    var templateFactory = function(str, data){
        var fn =  new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

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

// ---------------------------------------------------------------------------------------------------------------------

    /**
     * Resource loader factory
     *
     * @param {Object} cacheObject
     * @param {String} method
     * @param {String} format
     * @param {Object} self
     * @param {String} type
     *
     * @returns {Function}
     */
    var loaderFactory = function (cacheObject, method, format, methodOwner, type) {
        /**
         * @param {String} name resourceName
         *
         * @returns {Deferred}
         */
        return function (name) {
            var dfd = $.Deferred(),
                self = this;

            if (cacheObject[name]) {
                dfd.resolve();
                return dfd.promise();
            }

            /**
             * @param {Object} object query result
             */
            function successOrFail(object) {
                var camelCasedType = type.slice(0, 1).toUpperCase() + type.slice(1);
                self['push' + camelCasedType](name, object);

                dfd.resolve();
                if (object) { // if fail
                    EventManager.trigger(type + ':loaded', {name: name});
                    EventManager.trigger(type + ':' + name + ':loaded');
                }
            }

            var path = Core.descriptor.path[type] + format.replace('$0', name);

            if (type === 'module') {
                method.call(methodOwner, path, successOrFail);
            } else if (type === 'template') {
                method.call(methodOwner, path, successOrFail, 'html').error(successOrFail);
            } else {
                method.call(methodOwner, path, successOrFail).error(successOrFail);
            }
            return dfd.promise();
        }
    };

    /**
     * @namespace
     */
    var ModuleManager = {
        /**
         * @type Object modules cache
         */
        modules: {},
        /**
         * @type Object descriptors cache
         */
        descriptors: {},
        /**
         * @type Object locales cache
         */
        locales: {},
        /**
         * @type Object templates cache
         */
        templates: {},
        /**
         * Puts module to cache
         *
         * @param {String} name
         * @param {String} module
         *
         * @returns {ModuleManager}
         */
        pushModule: function (name, module) {
            if (module && !global.exports[name]) {
                global.exports[name] = module;
            }
            this.modules[name] = module || global.exports[name];
            return this;
        },
        /**
         * Puts descriptor to cache
         *
         * @param {String} name
         * @param {String} descriptor
         *
         * @returns {ModuleManager}
         */
        pushDescriptor: function (name, descriptor) {
            this.descriptors[name] = descriptor || {};
            return this;
        },
        /**
         * Puts locale to cache
         *
         * @param {String} name
         * @param {String} locale
         *
         * @returns {ModuleManager}
         */
        pushLocale: function (name, locale) {
            this.locales[name] = locale || {};
            return this;
        },
        /**
         * Puts locale to cache
         *
         * @param {String} name
         * @param {String} template
         *
         * @returns {ModuleManager}
         */
        pushTemplate: function (name, template) {
            this.templates[name] = $('<div/>').html(template);
            return this;
        },
        /**
         * Loads all module resources
         *
         * @param {String} name
         *
         * @returns {Deferred[]}
         */
        load: function (name) {
            // Check for template
            if (Core.descriptor.layout[name]) {
                return [this.getModule(name), this.getDescriptor(name), this.getLocale(name), this.getTemplate(name)];
            } else {
                return [this.getModule(name), this.getDescriptor(name), this.getLocale(name)];
            }
        }
    };

    /**
     * @name ModuleManager.getModule
     * @param {String} name resourceName
     *
     * @returns {Deferred}
     */
    ModuleManager.getModule = loaderFactory(ModuleManager.modules, require, '$0.js', this, 'module');

    /**
     * @name ModuleManager.getDescriptor
     * @param {String} name resourceName
     *
     * @returns {Deferred}
     */
    ModuleManager.getDescriptor = loaderFactory(ModuleManager.descriptors, $.getJSON, '$0.json', $, 'descriptor');

    /**
     * @name ModuleManager.getLocale
     * @param {String} name resourceName
     *
     * @returns {Deferred}
     */
    ModuleManager.getLocale = loaderFactory(ModuleManager.locales, $.getJSON, '$0.json', $, 'locale');

    /**
     * @name ModuleManager.getTemplate
     * @param {String} name resourceName
     *
     * @returns {Deferred}
     */
    ModuleManager.getTemplate = loaderFactory(ModuleManager.templates, $.get, '$0.html', $, 'template');

// ---------------------------------------------------------------------------------------------------------------------

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
    Sandbox.prototype.is = function (role) {
        if (arguments.length === 1 && this.descriptor.acl[role]) {
            return true;
        }
        return Array.prototype.slice(arguments).every($.proxy(function (item) {
            return this.descriptor.acl[item];
        }, this));
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
            EventManager.trigger(event, data || {});
        }

        return this;
    };

    /**
     * Hooks specific event
     *
     * @param {String}   event
     * @param {Function} hookFunction
     *
     * @returns {Sandbox}
     */
    Sandbox.prototype.hook = function (event, hookFunction) {
        if (this.is('hook:' + event)) {
            EventManager.hook(event, hookFunction);
        }

        return this;
    };

    /**
     * Removes hook from specific event
     *
     * @param {String}   event
     *
     * @returns {Sandbox}
     */
    Sandbox.prototype.unhook = function (event) {
        if (this.is('hook:' + event)) {
            EventManager.unhook(event);
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
        return Core.getTemplateFunction(this.descriptor.name, templateSelector);
    };

// ---------------------------------------------------------------------------------------------------------------------

    /**
     * @namespace
     */
    var EventManager = {
        /**
         * @type jQuery
         */
        $: $('<div/>'),
        /**
         * hooks list
         * @tyoe Object
         */
        hooks: {},
        /**
         * Hooked version of jQuery#trigger
         *
         * @param {String} event
         * @param {Array}  data
         *
         * @returns {EventManager}
         */
        trigger: function (event, data) {
            if (this.hooks[event]) {
                // Update event data
                var result = this.hooks[event](data);
                // Don't trigger event
                if (result === false) {
                    return this;
                }
                // Trigger with new data
                data = result || data;
            }
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
        },
        /**
         * Adds hook to specific event
         *
         * @param {String}   event
         *
         * @returns {EventManager}
         */
        hook: function (event, hookFunction) {
            // One hook for example
            this.hooks[event] = hookFunction;
            return this;
        },
        /**
         * Removes hook from specific event
         *
         * @param {String}   event
         *
         * @returns {EventManager}
         */
        unhook: function (event) {
            delete this.hooks[event];
            return this;
        }
    };

// ---------------------------------------------------------------------------------------------------------------------

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
         * @type Object
         */
        runningModules: {},

        /**
         * Starts app
         * 
         * @param {Object|String} descriptorOrFileName
         * @param {Function}      [callback=$.noop]
         *
         * @returns Core
         */
        init: function (descriptorOrFileName, callback) {
            callback = callback || $.noop;

            // Handles: init({ ... }, callback)
            if (typeof descriptorOrFileName === "object") {
                this.descriptor = descriptorOrFileName;
                this._initModules(callback);
                return this;
            }

            // Handles: init('/path/to/index.json', callback)
            $.getJSON(descriptorOrFileName, $.proxy(function (descriptor) {
                this.descriptor = descriptor;
                this._initModules(callback);
            }, this));
            return this;
        },

        /**
         * @param {Function} [callback=$.noop]
         * @private
         */
        _initModules: function (callback) {
            // Load all
            for (var i = 0, c = this.descriptor.modules.length, name, promises = []; i < c; i++) {
                name = this.descriptor.modules[i];
                promises = promises.concat(ModuleManager.load(name));
            }

            // Init all
            $.when.apply($, promises).then($.proxy(function () {
                for (var i = 0, c = this.descriptor.modules.length, name; i < c; i++) {
                    name = this.descriptor.modules[i];
                    var sandbox = new Sandbox(ModuleManager.descriptors[name]);
                    this.runningModules[name] = ModuleManager.modules[name];
                    ModuleManager.modules[name].init(sandbox);
                }
                (callback || $.noop)();
                EventManager.trigger('ready');
            }, this));
        },

        /**
         * Public version of _initModules
         *
         * @param {String}   name
         * @param {Function} [callback=$.noop]
         *
         * @returns Core
         */
        initModule: function (name, callback) {
            if (this.runningModules[name]) {
                (callback || $.noop)(false);
                return this;
            }
            $.when.apply($, ModuleManager.load(name))
            .then($.proxy(function () {
                var sandbox = new Sandbox(ModuleManager.descriptors[name]);
                this.runningModules[name] = ModuleManager.modules[name];
                ModuleManager.modules[name].init(sandbox);
                (callback || $.noop)();
            }, this));
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
        getTemplateFunction: function (moduleName, templateSelector) {
            var templateText = ModuleManager.templates[moduleName];
            if (templateText) {
                templateText = templateText.find(templateSelector)[0];
                if (templateText) {
                    return templateFactory(templateText.innerHTML);
                }
            }
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
            var locale = ModuleManager.locales[moduleName][message];
            return (typeof locale === "object" ? locale[this.descriptor.locale] : locale) || message;
        }
    };

// ---------------------------------------------------------------------------------------------------------------------

    /**
     * Global Core object
     *
     * @namespace
     */
    var CorePublic = {
        trigger:              $.proxy(EventManager.trigger, EventManager),
        bind:                 $.proxy(EventManager.bind, EventManager),
        unbind:               $.proxy(EventManager.unbind, EventManager),
        on:                   $.proxy(EventManager.bind, EventManager),

        getModule:            $.proxy(ModuleManager.getModule, ModuleManager),
        getDescriptor:        $.proxy(ModuleManager.getDescriptor, ModuleManager),
        getLocale:            $.proxy(ModuleManager.getLocale, ModuleManager),
        getTemplate:          $.proxy(ModuleManager.getTemplate, ModuleManager),

        pushModule:           $.proxy(ModuleManager.pushModule, ModuleManager),
        pushDescriptor:       $.proxy(ModuleManager.pushDescriptor, ModuleManager),
        pushLocale:           $.proxy(ModuleManager.pushLocale, ModuleManager),
        pushTemplate:         $.proxy(ModuleManager.pushTemplate, ModuleManager),

        init:                 $.proxy(Core.init, Core),
        destroyModule:        $.proxy(Core.destroyModule, Core),
        initModule:           $.proxy(Core.initModule, Core),
        getTemplateFunction:  $.proxy(Core.getTemplateFunction, Core),
        getText:              $.proxy(Core.getText, Core),
        getBox:               $.proxy(Core.getBox, Core)
    };        

// ---------------------------------------------------------------------------------------------------------------------    

    if (!global) {
        return CorePublic;
    }
    if (!global.exports) {
        global.exports = {};
    }
    global.exports.Core = CorePublic;
    
}(this, jQuery, $script));