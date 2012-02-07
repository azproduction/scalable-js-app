function EventManager(require) {
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
}