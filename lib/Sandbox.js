function Sandbox(require) {
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
        return Core.getTemplate(this.descriptor.name, templateSelector);
    };

    // exports
    return Sandbox;
}