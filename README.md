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
    pageId: '',     // The Id of the current page/article
    pageType: '',   // The type of page/article (page, article, application etc.)
    clientId: '',   // The providers ID, supplied by SPT.
}
```

### Activity.Event(eventType)

#### Activity.Event.pageLoad(type, title)

##### Extra parameter suggestions

`content` store the content of the submitted form.

#### Activity.Event.trackForm(formId, contentType, title, content)

##### Extra parameter suggestions

`content` store the content of the submitted form.

`inReplyTo` a string or a object that links the this form submission to a some other entity.

#### Activity.Event.trackComment(formId, commentId)

##### Extra parameter suggestions

`content` store the content of the comment.

`inReplyTo` a string or a object that links this comment to a page/article or another comment.

#### Activity.Event.trackPoll(formId, question)

##### Custom data suggestion

`spt:options` and array of options to the poll

`spt:answers` and array of answers given to the poll

#### Activity.Event.trackClick(elementId, name, targetType, targetId)

##### Extra parameter suggestions

`displayName` To get a good textual representation. Can be used for both primary and secondary object.

#### Activity.Event.trackSocial(elementId, networkName)

#### Activity.Event.trackMediaState()

#### Activity.Event.trackScrollEvent()

#### Activity.Event.trackExitEvent()

#### Activity.Event.trackEvent()

#### Activity.Event.addParameter(obj, parameters)

#### Activity.Event.addCumstomData(obj, parameters)

#### Activity.Event.send()
