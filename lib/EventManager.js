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
}