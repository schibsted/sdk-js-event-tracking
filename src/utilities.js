function getTimeStamp(){
    var now = new Date(),
    timezoneOffset = -now.getTimezoneOffset(),
    diff = timezoneOffset >= 0 ? '+' : '-',
    padding = function(num) {
        var norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
    };

    return now.getFullYear()
        + '-' + padding(now.getMonth()+1)
        + '-' + padding(now.getDate())
        + 'T' + padding(now.getHours())
        + ':' + padding(now.getMinutes())
        + ':' + padding(now.getSeconds())
        + diff + padding(timezoneOffset / 60)
        + ':' + padding(timezoneOffset % 60);
}
function getUserId(){
    return 1337;
}
function getParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}


function getDataAttributes(element, dataContainer){

    var data = dataContainer || {};

    data.verb = element.getAttribute('data-verb');
    if(data.verb === null && element.nodeName.toLowerCase() !== 'body'){
        return getDataAttributes(element.parentNode, {});
    }
    if(data.verb === null){
        return false;
    }
    return data;
}
function createTrackerProcessData(activities, verb){
    // TODO: Better errror validation
    var tracker = new DataTracker(_opt, activities, verb);
    activityQueue.push(tracker.getActivity());
    return processActivityQueue();
}
function findFormElement(element){

    if(element.tagName.toLowerCase() !== 'form'){
        return findFormElement(element.parentNode);
    }
    else if(element.tagName.toLowerCase() === 'body'){
        return null;
    }
    return element;
}
function findOptions(element, optionsObject) {

    var children = element.childNodes;

    for(var i=0; i < children.length; i++){

        if(children[i].nodeName !== "#text"){
            if(children[i].tagName.toLowerCase() === 'input' && children[i].getAttribute('type').toLowerCase() === 'radio'){
                optionsObject.options.push(children[i].getAttribute('value').toLowerCase());
                if(children[i].checked){
                    optionsObject.answer.push(children[i].getAttribute('value').toLowerCase());
                }
            }
            else if(children[i].tagName.toLowerCase() === 'input' && children[i].getAttribute('type').toLowerCase() === 'checkbox'){
                optionsObject.options.push(children[i].getAttribute('value').toLowerCase());
                if(children[i].checked){
                    optionsObject.answer.push(children[i].getAttribute('value').toLowerCase());
                }
            }
            if(children[i].childElementCount !== undefined && children[i].childElementCount > 0){
                var optionsObject = findOptions(children[i], optionsObject);
                if(children.length <= i){
                    return optionsObject;
                }
            }
        }
    }
    return optionsObject;
}
function getViewportDimensions() {
    var viewportwidth;
    var viewportheight;

    if (typeof window.innerWidth != 'undefined') {
        viewportwidth = window.innerWidth,
        viewportheight = window.innerHeight
    }
    else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth !='undefined' && document.documentElement.clientWidth != 0){
        viewportwidth = document.documentElement.clientWidth,
        viewportheight = document.documentElement.clientHeight
    }
    else {
        viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
        viewportheight = document.getElementsByTagName('body')[0].clientHeight
    }
    return viewportwidth + 'x' + viewportheight;
}
function checkMandatoryOptions(){
    if(_opt.clientId === undefined){
        return false;
    }
    if(_opt.pageId === undefined){
        return false;
    }
    return true;
}
