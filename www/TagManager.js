(function () {
    var cordovaRef = window.PhoneGap || window.cordova || window.Cordova;
    var queue = [];
    var runInterval = 1000;
    var running = false;
    var runner;

    function TagManager() {}

    // initialize google analytics with an account ID and the min number of seconds between posting
    //
    // id = the GTM account ID of the form 'GTM-000000'
    // period = the minimum interval for transmitting tracking events if any exist in the queue
    TagManager.prototype.init = function (success, fail, id, period) {
        runner = setInterval(run, runInterval);
        running = true;
        var timestamp = new Date().getTime();
        queue.push({
            timestamp: timestamp,
            method: 'initGTM',
            success: success,
            fail: fail,
            id: id,
            period: period
        });
    };

    // log an event
    //
    // category = The event category. This parameter is required to be non-empty.
    // eventAction = The event action. This parameter is required to be non-empty.
    // eventLabel = The event label. This parameter may be a blank string to indicate no label.
    // eventValue = The event value. This parameter may be -1 to indicate no value.
    // userId = The ID of the user to track
    TagManager.prototype.trackEvent = function (success, fail, category, eventAction, eventLabel, eventValue, userId) {
        var timestamp = new Date().getTime();
        queue.push({
            timestamp: timestamp,
            method: 'trackEvent',
            success: success,
            fail: fail,
            category: category,
            eventAction: eventAction,
            eventLabel: eventLabel,
            eventValue: eventValue,
            userId: userId
        });
    };

    // log a page view
    //
    // pageURL = the URL of the page view
    // userId = the ID of the user to track
    TagManager.prototype.trackPage = function (success, fail, pageURL, userId) {
        var timestamp = new Date().getTime();
        queue.push({
            timestamp: timestamp,
            method: 'trackPage',
            success: success,
            fail: fail,
            pageURL: pageURL,
            userId: userId
        });
    };

    // log a timing
    //
    // category = The timing category. This parameter is required to be non-empty.
    // timingVar = The timing var. This parameter is required to be non-empty.
    // timingLabel = The timing label. This parameter may be a blank string to indicate no label.
    // timingValue = The timing value. This parameter is in ms
    // userId = The ID of the user to track
    TagManager.prototype.trackTiming = function(success, fail, category, timingVar, timingLabel, timingValue, userId) {
        var timestamp = new Date().getTime();
        queue.push({
            timestamp: timestamp,
            method: 'trackTiming',
            success: success,
            fail: fail,
            category: category,
            timingVar: timingVar,
            timingLabel: timingLabel,
            timingValue: timingValue,
            userId: userId
        });
    };

    // log an exception
    //
    // exceptionDescription = The exception description. This parameter is required to be non-empty.
    // exceptionFatal = If the exception if fatal or not. Defaults to true
    // userId = The ID of the user to track
    TagManager.prototype.trackException = function(success, fail, exceptionDescription, exceptionFatal, userId) {
        var timestamp = new Date().getTime();
        queue.push({
            timestamp: timestamp,
            method: 'trackException',
            success: success,
            fail: fail,
            exceptionDescription: exceptionDescription,
            exceptionFatal: exceptionFatal ? 1 : 0,
            userId: userId
        });
    };


    // force a dispatch to Tag Manager
    TagManager.prototype.dispatch = function (success, fail) {
        var timestamp = new Date().getTime();
        queue.push({
            timestamp: timestamp,
            method: 'dispatch',
            success: success,
            fail: fail
        });
    };

    // exit the TagManager instance and stop setInterval
    TagManager.prototype.exit = function (success, fail) {
        var timestamp = new Date().getTime();
        queue.push({
            timestamp: timestamp,
            method: 'exitGTM',
            success: success,
            fail: fail
        });
    };

    if (cordovaRef && cordovaRef.addConstructor) {
        cordovaRef.addConstructor(init);
    }
    else {
        init();
    }

    function init() {
        if (!window.plugins) {
            window.plugins = {};
        }
        if (!window.plugins.TagManager) {
            window.plugins.TagManager = new TagManager();
        }
    }

    function run() {
        if (queue.length > 0) {
            var item = queue.shift();
            if (item.method === 'initGTM') {
                cordovaRef.exec(item.success, item.fail, 'TagManager', item.method, [item.id, item.period]);
            }
            else if (item.method === 'trackEvent') {
                if (item.userId) {
                    cordovaRef.exec(
                        item.success, item.fail, 'TagManager', item.method,
                        [item.category, item.eventAction, item.eventLabel, item.eventValue, item.userId]
                    );
                } else {
                    cordovaRef.exec(
                        item.success, item.fail, 'TagManager', item.method,
                        [item.category, item.eventAction, item.eventLabel, item.eventValue, null]
                    );
                }
            }
            else if (item.method === 'trackPage') {
                if (item.userId) {
                    cordovaRef.exec(item.success, item.fail, 'TagManager', item.method, [item.pageURL, item.userId]);
                } else {
                    cordovaRef.exec(item.success, item.fail, 'TagManager', item.method, [item.pageURL, null]);
                }
            } else if (item.method === 'trackTiming') {
                if (item.userId) {
                    cordovaRef.exec(
                        item.success, item.fail, 'TagManager', item.method,
                        [item.category, item.timingVar, item.timingLabel, item.timingValue, item.userId]
                    );
                } else {
                    cordovaRef.exec(
                        item.success, item.fail, 'TagManager', item.method,
                        [item.category, item.timingVar, item.timingLabel, item.timingValue, null]
                    );
                }
            } else if (item.method === 'trackException') {
                if (item.userId) {
                    cordovaRef.exec(
                        item.success, item.fail, 'TagManager', item.method,
                        [item.exceptionDescription, item.exceptionFatal, item.userId]
                    );
                } else {
                    cordovaRef.exec(
                        item.success, item.fail, 'TagManager', item.method,
                        [item.exceptionDescription, item.exceptionFatal, null]
                    );
                }
            } else if (item.method === 'dispatch') {
                cordovaRef.exec(item.success, item.fail, 'TagManager', item.method, []);
            }
            else if (item.method === 'exitGTM') {
                cordovaRef.exec(item.success, item.fail, 'TagManager', item.method, []);
                clearInterval(runner);
                running = false;
            }
        }
    }

    if (typeof module != 'undefined' && module.exports) {
        module.exports = new TagManager();
    }
})();
/* End of Temporary Scope. */
