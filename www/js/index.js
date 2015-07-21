var app = {

    // Application Constructor
    initialize: function () {
        app.bindEvents();
    },
    /* Bind Event Listeners
    
      Bind any events that are required on startup. Common events are:
     'load', 'deviceready', 'offline', and 'online'.
    */
    bindEvents: function () {
        document.addEventListener('deviceready', app.onDeviceReady, false);

        // fast click lib
        $(function () {
            FastClick.attach(document.body);
        });
         app.receivedEvent('#newsList');
        // UNCOMMENT FOR DESKTOP DEBUGING ONLY
    },
    /* deviceready Event Handler
     
     The scope of 'this' is the event. In order to call the 'receivedEvent'
     function, we must explicitly call 'app.receivedEvent(...);'
    */
    onDeviceReady: function () {
        app.receivedEvent('#newsList');

    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        $(function () {

            // local variables, the feed array, UL html, feed contents to be displayed, currentFeed, index
            var unorderedList = $(id).children(),
                itemList = ['author', 'title', 'content', 'publishedDate'],
                currentFeed,
                currentArticleIndex,
                clickedButtonIndex;

            // hammer variables
            var element = document.getElementById('target'),
                options = {
                    dragLockToAxis: true,
                    dragBlockHorizontal: true
                };

            var hammertime = new Hammer(element); // hammer object

            // click events for the three buttons, two share the same events and functions one is different
            $('#itcButton, #mainButton, #scheduleButton').on('click', function () { // navigation in the menu

                clickedButtonIndex = $(this).index();
                // initial feed rendering
                if (clickedButtonIndex !== 2) {

                    // show hide depenging on the button selected
                    $('#schedule').hide();
                    $('#newsList').show();

                    currentArticleIndex = 0;
                    currentFeed = JSON.parse(localStorage.getItem(feedBuilder[clickedButtonIndex]));
                    app.newsRenderer(unorderedList, currentArticleIndex, currentFeed, itemList);

                } else {

                    app.shcheduleInitiliaze(); // more information on the bottom of the file

                    // show hide depenging on the button selected
                    $('#schedule').show();
                    $('#newsList').hide();
                }
            });

            // hammer js event handlers
            hammertime.on("swipeleft swiperight", function (ev) {

                if (ev.type === 'swiperight' && currentArticleIndex !== 0 && clickedButtonIndex !== 2) {

                    currentArticleIndex--;
                    app.newsRenderer(unorderedList, currentArticleIndex, currentFeed, itemList); // render
                } else if (ev.type === 'swipeleft' && currentArticleIndex < currentFeed.length - 1 && clickedButtonIndex !== 2) {

                    currentArticleIndex++;
                    app.newsRenderer(unorderedList, currentArticleIndex, currentFeed, itemList); // render
                }
            });

            /*
            Old setup, laggy on android devices
            
            $('#newsList').show();
            app.newsRenderer(unorderedList, currentArticleIndex, currentFeed, itemList);
            
            // swipe event handlers
            $('.app').on('swiperight', function () {
                if (currentArticleIndex !== 0) {
                    currentArticleIndex--;
                    app.newsRenderer(unorderedList, currentArticleIndex, currentFeed, itemList);
                }
            });

            $('.app').on('swipeleft', function () {
                if (currentArticleIndex < currentFeed.length - 1) {
                    currentArticleIndex++;
                    app.newsRenderer(unorderedList, currentArticleIndex, currentFeed, itemList);
                }
            });
            */

        });
    },
    // rendering function with 4 parameters
    newsRenderer: function (listObject, counter, feedObject, propertyList) {

        $.each(listObject, function (index, el) {

            $(this).show(); // showing all li elements
            el.innerHTML = feedObject[counter][propertyList[index]];

            if (!$.trim($(el).text())) { // check for empty text filled with spaces
                $(this).hide(); // hiding empty elements
            }
        });

        // visual tweeks
        $('#deviceready, .app, body').scrollTop(0);
        $('img').not('#smallImage').hide();
        $('#counter').text(counter + 1);
    },
    tableFormatter: function () {

        // function for swap rows and cols in our table, so we are able to use it on mobile devieces, NOT USED, saved anyway
        $("table").each(function () {
            var $this = $(this);
            var newrows = [];
            $this.find("tr").each(function () {
                var i = 0;
                $(this).find("td").each(function () {
                    i++;
                    if (newrows[i] === undefined) {
                        newrows[i] = $("<tr></tr>");
                    }
                    newrows[i].append($(this));
                });
            });
            $this.find("tr").remove();
            $.each(newrows, function () {
                $this.append(this);
            });
        });
    },
    shcheduleInitiliaze: function () {

        var scheduleSourceHtml = JSON.parse(localStorage.getItem('schedule')); // schedule html

        // add the schedule html in hidden div element, after replacing the whole html with only the time table
        $('#schedule').html(scheduleSourceHtml
                .responseText.split("<body")[1]
                .split(">")
                .slice(1)
                .join(">")
                .split("</body>")[0])
            .html($('.timetable-item'));

        //prevent href click action
        $("a").click(function () {
            return false;
        });
        //app.tableFormatter(); // swap rows and cols in our table, not going to use this anyway
    }
};

app.initialize();