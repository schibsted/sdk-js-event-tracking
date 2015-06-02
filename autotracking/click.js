'use strict';

module.exports.button = function(activity) {
    document.addEventListener('click', function(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;

        if (/.*track-click.*/.test(target.className)) {
            activity.events.trackClick(target.id).send();
        }

    }, false);

};

module.exports.submit = function(activity) {

    document.addEventListener('submit', function(e) {
        var target = e.target || e.srcElement;
        var result = searchTrackingClass(target);

        if (result === null) {
            return;
        } else if (!result.obj.id) {
            return;
        } else if (result.type === 'track-form') {
            activity.events.trackForm(result.obj.id, 'Note', 'Post').send();
        } else if (result.type === 'track-comment') {
            activity.events.trackComment(result.obj.id, 'Post').send();
        } else if (result.type === 'track-poll') {
            activity.events.trackPoll(result.obj.id, 'Post').send();
        }

        function searchTrackingClass(elem) {
            if (elem.className.indexOf('track-comment') > -1) {
                return {obj: elem, type: 'track-comment'};
            } else if (elem.className.indexOf('track-poll') > -1) {
                return {obj: elem, type: 'track-poll'};
            } else {
                return {obj: elem, type: 'track-form'};
            }
        }
    }, false);
};
