function processActivityQueue(){

    // TODO: Extend this function to enable bulk sending and manual sending of data.

    var errCount = 0;

    while(activityQueue.length > 0 && errCount <5){
        if(sendData(activityQueue[0], /*'http://127.0.0.1:1337/api'*/'http://127.0.0.1:8002/api/v1/track')){
            activityQueue.shift();
        }
        else {
            errCount++;
        }
    }
    if(errCount >= 5){
        // TODO: Create alert call to server here!
        return false;
    }
    return true;
}
function sendData(data, serverUri, callback) {

    //console.log(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', serverUri);
    //console.log('request sent to ' + serverUri);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.send(data);
    console.log(data);

    var response = 0;

    xhr.onreadystatechange = function(){
        if(xhr.readyState===4){
            callback(xhr.status, )
        }
    };

}
function dataSentCallback(response, data){
    
}
