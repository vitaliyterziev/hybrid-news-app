// CROSS ORIGIN SETUP TO GET THE HTML SOURCE
jQuery.ajax = (function (_ajax) {

    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol) ? 's' : '') + '://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="*"';

    function isExternal(url) {
        return !exRegex.test(url) && /:\/\//.test(url);
    }

    return function (o) {

        var url = o.url;

        if (/get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url)) {

            // Manipulate options so that JSONP-x request is made to YQL

            o.url = YQL;
            o.dataType = 'json';

            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data) : '')
                ),
                format: 'xml'
            };

            // Since it's a JSONP request
            // complete === success
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }

            o.success = (function (_success) {
                return function (data) {

                    if (_success) {
                        // Fake XHR callback.
                        _success.call(this, {
                            responseText: (data.results[0] || '')
                                // YQL screws with <script>s
                                // Get rid of them
                                .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                        }, 'success');
                    }

                };
            })(o.success);

        }

        return _ajax.apply(this, arguments);

    };

})(jQuery.ajax);


// RSS READ/STORE FUNCTION (injects rss feed strings in the localstorage database)
var feedBuilder = (function () {

    // variables for the static URL for RSS feed - 
    var RSSURL = ['http://departments.unwe.bg/itc/bg/events/feed', 'http://www.unwe.bg/bg/events/feed'],
        RSSNUMBER = 30, // number of feeds
        localDBKeys = ['feedsItc', 'feedsMain']; // database keys

    // ajax method, takes one object with the below properties 
    RSSURL.forEach(function (el, index) {
        $.ajax({
            type: "GET",
            url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=' + RSSNUMBER + '&output=json&callback=?&q=' + encodeURIComponent(el),
            dataType: 'json',
            error: function (jqXHR, textStatus, errorThrown) {

            },
            success: function (xml) {

                // reading the RSS data
                var postlist = xml.responseData.feed.entries;
                // add feeds to local storage
                localStorage.setItem(localDBKeys[index], JSON.stringify(postlist));
            }
        });
    });
    return localDBKeys;
})();


// HTML parser form URL, getting all the html available (no need for google feed service here)
var scheduleData = (function () {

    var person = window.prompt('Въведете първата буква от името си и фамилия на латиница за да получите достъп до графика си. пример: amurdjeva \nЗаблежка: използвайте "landscape" за разглеждане на графика').toString(); // value for the URL string

    $.ajax({
        url: 'http://blogs.unwe.bg/' + person + '/?view=teaching',
        type: 'GET',
        dataType: 'html',
        success: function (data) {

            localStorage.setItem('schedule', JSON.stringify(data));
        }
    });
})();