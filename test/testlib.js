function providerAsserts(d){
    // Provider asserts
    assert.match(d.provider['@id'], 'urn:spt.no:'+_opt.clientId);
    assert.match(d.provider['@type'], 'Organization');
    assert.equals(objectTypes(d.provider['@type']), true);
    //assert.match(d.provider['url'], );
}
function actorAsserts(d){
    // Actor asserts
    refute.match(d.actor['@type'], undefined);
    refute.match(d.actor['@id'], undefined);
    assert.match(d.actor['spt:acceptLanguage'], navigator.language);
    assert.match(d.actor['spt:screenSize'], /([0-9]{1,4})x([0-9]{1,4})/);
    assert.match(d.actor['spt:viewportSize'], /([0-9]{1,4})x([0-9]{1,4})/);
    refute.match(d.actor['spt:userAgent'], undefined);
    assert.equals(objectTypes(d.actor['@type']), true);
}
function headerAsserts(d){
    refute.match(d['@context'], undefined);
    assert.equals(headerTypes(d['@type']), true);
    assert.match(d.published, /(\d\d\d\d)\D?(\d\d)\D?(\d\d)\D?(\d\d)\D?(\d\d\D?(\d\d\.?(\d*))?)(Z|[+-]\d\d?(:\d\d)?)?/);
}
function objectAsserts(d){
    refute.match(d.object['@type'], undefined);
    refute.match(d.object['@id'], undefined);
    assert.match(d.object.url, document.URL);
    assert.equals(objectTypes(d.object['@type']), true);
}
function headerTypes(type){
    var testType;
    var allowedHeaderTypes = ["accept", "achieve", "add", "announce", "arrive", "assign", "block", "claim", "complete", "confirm", "connect", "create", "delete", "dislike", "experience", "favorite", "flag", "follow", "friendrequest", "give", "ignore", "invite", "join", "leave", "like", "listen", "move", "offer", "post", "question", "reject", "read", "remove", "reservation", "respond", "review", "save", "share", "tentativeReject", "tentativeAccept", "travel", "undo", "update", "view", "watch"];

    // Check if array if so, use only first item

    if(Array.isArray(type)){
        testType = type[0];
    }
    else {
        testType = type;
    }

    // Check if type is prefixed by "spt" if so return true
    if(testType.substring(0,4).toLowerCase() === 'spt:'){
        return true;
    }
    else if(allowedHeaderTypes.indexOf(testType.toLowerCase()) >= 0){
        return true;
    }
    return false;

}
function objectTypes(type){
    var testType;
    var allowedObjectTypes = ["album", "application", "article", "audio", "community", "content", "device", "document", "event", "folder", "group", "identity", "image", "mention", "note", "organization", "page", "person", "place", "possibleAnswer", "process", "question", "reservation", "role", "service", "story", "video"];

    // Check if array if so, use only first item

    if(Array.isArray(type)){
        testType = type[0];
    }
    else {
        testType = type;
    }

    // Check if type is prefixed by "spt" if so return true
    if(testType.substring(0,4).toLowerCase() === 'spt:'){
        return true;
    }
    else if(allowedObjectTypes.indexOf(testType.toLowerCase()) >= 0){
        return true;
    }
    return false;
}
