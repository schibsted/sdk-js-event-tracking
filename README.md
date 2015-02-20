# sdk-js-event-tracking

## Get up and running:

`npm install`

`grunt`

## When developing:

`./run-watch.sh`

# Documentation

This documentation is the target for the functionality of v1.

## Activity(_opt)

```
_opt = {
    pageId: '',
    pageType: '',
    clientId: '',
}
```

### Activity.Event(eventType)

#### Activity.Event.pageLoad(type, title)

#### Activity.Event.trackForm(formId, contentType, title, content)

#### Activity.Event.trackComment(formId, commentId)

##### Extra parameter suggestions

`content` store the content of the comment.

`inReplyTo` a string or a object that links the this comment to a page/article or another comment.

#### Activity.Event.trackPoll(formId, question)

##### Custom data suggestion

`spt:options` and array of options to the poll

`spt:answers` and array of answers given to the poll

#### Activity.Event.trackClick()

#### Activity.Event.trackMediaState()

#### Activity.Event.trackScrollEvent()

#### Activity.Event.trackExitEvent()

#### Activity.Event.trackEvent()

#### Activity.Event.addParameter(obj, parameters)

#### Activity.Event.addCumstomData(obj, parameters)

#### Activity.Event.send()
