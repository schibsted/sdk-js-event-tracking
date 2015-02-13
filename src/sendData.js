function processActivityQueue(){

    var result = sendData(activityQueue);
    activityQueue.shift();

    if(errorCount >= 5){
        // TODO: Report to server
        console.log('data was not sent in ' + errorCount + ' tries');
    }
}
function sendData(data) {

    //console.log(data);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', serverUri);
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
            if(response === 200) {
                errorCount = 0;
                return true;
            }
            else {
                activityQueue = activityQueue.concat(data);
                errorCount++;
                return false;
            }
        }
    };

}
