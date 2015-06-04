'use strict';

var types = [
    'track-comment',
    'track-poll',
    'track-form'
];

module.exports.button = function(activity) {
    document.addEventListener('click', function(e) {
        var target = e.target || e.srcElement;

        if (/.*track-click.*/.test(target.className)) {
            activity.events.trackClick(target.id).send();
        }

    }, false);

};

module.exports.submit = function(activity) {

    document.addEventListener('submit', function(e) {
        var target = e.target || e.srcElement,
            type;

        // the target doesn't exist or has no id
        if (!target || !target.id) {
            return;
        }

        // returns the types that are in the classname and returns the first item
        type = types.filter(function (type) { return target.className.indexOf(type) > -1; })[0];

        switch (type) {
        case 'track-poll':
            activity.events.trackPoll(target.id, 'Post').send();
            break;
        case 'track-comment':
            activity.events.trackComment(target.id, 'Post').send();
            break;
        default:
            activity.events.trackForm(target.id, 'Note', 'Post').send();
        }
    }, false);
};
