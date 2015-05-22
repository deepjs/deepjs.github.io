/**  @author Gilles Coomans <gilles.coomans@gmail.com> */
require.config({
    baseUrl: "/libs",
    paths: {}
});
require([
        "deepjs/deep",
        "/js/dp-try.js",
        "deep-views/lib/jquery-dom-protocol",
        "deep-views/index",
        "deepjs/lib/nodes-composer",
        "deepjs/lib/nodes-promise"
    ],
    function(dp, dpTry, domProtocol) {
        window.deep = dp; // place deep in globals. (I like it so in the browser ;)

        deep.protocols.dom = domProtocol;
        deep.context("$", $);

        $(".dp-try").each(dpTry);


        $(".code").each(function() {
            $(this).html(hljs.highlight("javascript", $(this).text().trim()).value);
        });

        //jQuery for page scrolling feature - requires jQuery Easing plugin
        $('a.page-scroll').click(function(event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 1000, 'easeInOutExpo');
            event.preventDefault();
        });

        deep.log("hello world.")
    });
