# Different type of implementations

If you for some reason is not able to use the recommended snippet, there are alternative ways of adding the script to your page.

## Requirejs

If you are using the default tracking snippet on a site that has requirejs installed, you may experience errors. The correct way to implement the script on such a page is as follows:

```
requirejs.config({
	paths: {
		pulse2: '//d1nf1ogr7o23z7.cloudfront.net/autoTracker.min',
	}
});

// pulse2opt could possibly go here.

var AutoTrack;

define(['pulse2'], function(a) {
	AutoTrack = a;
});

```

The pulse2opt object still needs to be present in your DOM like before, or you could put it before you define pulse2 with requirejs.

## Tealium

The challenge with tealium is that it runs the tracking script in a container that can't be accessed from global/DOM. Since the tracking script is inserted in to the DOM, but the pulse2opt-object is in the container, the script can't access the values it needs to initiate and run. A rewrite that injects the pulse2opt-object in to the DOM has therefor been made, and proven to work with the tealium tag manager, and possibly with other tagmanagers as well.

```

(function() {
    var d = document, g = d.createElement('script'), f = d.createElement('script'), s = d.getElementsByTagName('script');
    g.src = "//d1nf1ogr7o23z7.cloudfront.net/autoTracker.min.js";
	f.type = "text/javascript";
	f.innerHTML = "var pulse2opt = {clientId: 'yourClientId'}"; // the pulse2opt are added here as a string.
	s[s.length-1].parentNode.insertBefore(f, s[s.length-1]);
    s[0].parentNode.insertBefore(g, s[0]);
})();

```

Please note that all variables that are added to the pulse2opt must be variables that are readable from the DOM.
