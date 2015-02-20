'use strict';

var ao = require('./ActivityObject.js').Activity;

var Activity = new ao.Activity(_opt);

module.exports = {
    Event: function(target, id, type) {
        return {

            eventType:              eventType,
            eventObject[eventType]: {},

            function addParameter(key, value){
                this.eventObject[eventType].key = value;
            }
            function shipToActivity() {
                Activity.appendActivityObject(eventObject);
                eventObject
            }
        };
    }
}
