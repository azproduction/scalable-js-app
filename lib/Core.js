function Core(require, exports) {
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
         * @returns Core
         */
        init: function () {
            this.descriptor = require('descriptor');
            this.descriptors = require('descriptors');
            this.templates = require('templates');
            this.locales = require('locales');

            this._initModules();
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
}