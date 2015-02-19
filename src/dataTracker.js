'use strict';

function DataTracker(_opt, activityObjectsArray, verb) {
    return {
        siteId:         _opt.clientId || undefined,
        trackingUrl:    _opt.trackingUrl || undefined,
        userObject:     new UserData(),
        published:      getTimeStamp(),
        language:       _opt.language || 'en',
        doNottrack:     _opt.doNotTrack || false,
        activities:     activityObjectsArray || [],
        verb:           verb,
        context:        ['http://www.w3.org/ns/activitystreams', {spt:'http://spt.no'}],

        createActor: function() {
            var actor = {};

            actor['@type'] = 'Person';

            var anonymousId = userObject.userId;

            if (anonymousId) {
                actor['@id'] = anonymousId;
            }

            actor['spt:userAgent'] = navigator.userAgent;
            actor['spt:ip'] = ''; // TODO: Find a way to inject this on requesting this resource.
            actor['spt:screenSize'] = window.screen.width + 'x' + window.screen.height;
            actor['spt:viewportSize'] = getViewportDimensions();
            actor['spt:acceptLanguage'] = this.getDeviceLanguage();

            return actor;
        },

        createProvider: function() {
            // FIXME: Go over this info. ID and URL might need to be fixed
            var provider = {};

            provider['@type'] = 'Organization';
            provider['@id'] = 'urn:spt.no:' + this.siteId;
            // provider['spt:client'] = this.siteId;
            provider.url = document.URL;

            // TODO: Determin where campaigns should go.
            /*var campaign = this.getCampaignMeta();
             if(campaign !== null){
             generator.campaign = campaign;
             }*/

            return provider;
        },

        appendActivityObject: function(activityObject) {
            this.activities.push(activityObject);
        },

        getCampaignMeta: function() {
            var sourceKey = ['utm_source', 'Data_source'];
            var mediumKey = ['utm_medium', 'Data_medium'];
            var nameKey = ['utm_campaign', 'Data_campaign'];

            var campaign = {};
            var returnValueFlag = false;

            var source = this.getParameterByArray(sourceKey);
            if (source !== null) {
                campaign.campaignSource = source;
                returnValueFlag = true;
            }

            var medium = this.getParameterByArray(mediumKey);
            if (medium !== null) {
                campaign.campaignMedium = medium;
                returnValueFlag = true;
            }

            var name = this.getParameterByArray(nameKey);
            if (name !== null) {
                campaign.campaignName = name;
                returnValueFlag = true;
            }

            if (returnValueFlag) {
                return campaign;
            }

            return null;
        },

        getParameterByArray: function(searchArray) {
            for (var i = 0; i < searchArray.length; i++) {
                if (getParameter(searchArray[i]) !== null) {
                    return getParameter(searchArray[i]);
                }
            }

            return null;
        },
        // TODO: Determine if browser language is something we should include and in what form.
        getDeviceLanguage: function() {
            var userLanguage = 'NaN';

            if (navigator.userLanguage){
                userLanguage = navigator.userLanguage;
            } else if (navigator.language){
                userLanguage = navigator.language;
            }

            return userLanguage;
        },

        getActivity: function() {
            var retVal = {};

            retVal['@context'] = this.context;

            if (this.verb && this.verb !== undefined && this.verb !== null) {
                retVal['@type'] = this.verb;
            } else {
                return 'no verb found';
            }

            if (this.published) {
                retVal.published = this.published;
            } else {
                return 'no timestamp was found';
            }

            for (var i = 0; i < this.activities.length; i++) {
                for (var attrname in this.activities[i]) {
                    if (this.activities[i].hasOwnProperty(attrname)) {
                        retVal[attrname] = this.activities[i][attrname];
                    }
                }
            }

            // Add actor
            retVal.actor = this.createActor();
            retVal.provider = this.createProvider();

            // console.log(JSON.stringify(retVal));

            return JSON.stringify(retVal);
        }
    };
}
