function createTrackerProcessData(activities, verb, callback){

    var tracker = new DataTracker(_opt, activities, verb);
    activityQueue.push(tracker.getActivity());
    return processActivityQueue(callback);
}
function processActivityQueue(callback){

    var result = sendData(activityQueue, callback);
    activityQueue = [];

    if(errorCount >= 5){
        // TODO: Report to server
        console.log('data was not sent in ' + errorCount + ' tries');
    }
    return result;
}
function sendData(data, callback) {

    sentDataQueue.push(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', serverUri, true);
    //console.log('request sent to ' + serverUri);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    try {
        xhr.send(data);
    }
    catch(err){
        errorCount++;
    }

    xhr.onreadystatechange = function(){
        if(xhr.readyState===4){

            var sentData = sentDataQueue.shift();

            if(xhr.status === 200) {
                errorCount = 0;
            }
            else {
                activityQueue = activityQueue.concat(sentData);
                errorCount++;
            }
            if(callback !== undefined){
                callback(xhr, sentData);
            }
        }
    };
}
