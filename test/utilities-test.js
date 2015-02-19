"use strict";

buster.spec.expose();

var assert = buster.assert;
var refute = buster.refute;

buster.testCase('Utilities functions ', {
    'A correct timestamp is returned': function(){
        assert.match(getTimeStamp(), /(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d[:]?(\d\d\.?(\d*))?)(Z|[+-]\d\d?(:\d\d)?)?/);
    },
    'Campaign info can be found and returned': function(){
        var testParameters = '?utm_source=facebook&utm_medium=social&utm_campaign=testcampaign';

        assert.match(getParameter('utm_source', testParameters), 'facebook');
        assert.match(getParameter('utm_medium', testParameters), 'social');
        assert.match(getParameter('utm_campaign', testParameters), 'testcampaign');

        testParameters = '?data_source=email%20campaign&data_medium=email&data_campaign=email%20offer';

        assert.equals(getParameter('data_source', testParameters), 'email campaign');
        assert.equals(getParameter('data_medium', testParameters), 'email');
        assert.equals(getParameter('data_campaign', testParameters), 'email offer');

        assert.equals(getParameter('Data_source', testParameters), 'email campaign');
        assert.equals(getParameter('Data_medium', testParameters), 'email');
        assert.equals(getParameter('Data_campaign', testParameters), 'email offer');

        testParameters = '';

        assert.equals(getParameter('Data_source', testParameters), null);
        assert.equals(getParameter('Data_medium', testParameters), null);
        assert.equals(getParameter('Data_campaign', testParameters), null);

        assert.equals(getParameter('utm_source', testParameters), null);
        assert.equals(getParameter('utm_medium', testParameters), null);
        assert.equals(getParameter('utm_campaign', testParameters), null);
    },
    'Viewport dimensions have correct format': function(){
        assert.match(getViewportDimensions(), /([0-9]{1,4})x([0-9]{1,4})/);
    }
});
