
var activityQueue = [];

self.addEventListener('message', function(e) {
    //activityQueue.push(e.data);
    var result = sendData(e.data, 127.0.0.1:1337);
    self.postMessage(result);
}, false);


function sendData(data, serverUri) {

    var xhr = new XMLHttpRequest();
    xhr.open('post', serverUri);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.send(JSON.stringify(data));

    var response = 0;

    xhr.onreadystatechange = function(){
        if(xhr.readyState===4){
            response = xhr.status;
        }
    };
    if(response < 300 || response >= 200){
        return true;
    }
    return false;
}
