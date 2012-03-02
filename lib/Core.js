function Core(require, exports) {
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
}