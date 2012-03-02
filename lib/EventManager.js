function EventManager(require) {

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