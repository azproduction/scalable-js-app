function Sandbox(require) {
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
}