$("#main-navbar ul li a[href^='#']").on('click', smoothScroll);
$("#main-navbar a.navbar-brand[href^='#']").on('click', smoothScroll);

function smoothScroll(e) {

    // prevent default anchor click behavior
    e.preventDefault();

    // store hash
    var hash = this.hash;

    // animate
    $('html, body').animate({
        scrollTop: $(hash).offset().top
    }, 1000, function() {

        // when done, add hash to url
        // (default click behaviour)
        window.location.hash = hash;
    });

}