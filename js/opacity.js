/**
 * Created by jd.delavilleon on 12/12/2017.
 */


/** var divs = $('#explanation1');
$(window).on('scroll', function() {
   var st = $(this).scrollTop();
   divs.css({ 'opacity' : (1 - st/600) });
});

var div2 = $('#explanation2');
$(document).ready(function(){div2.css('opacity', 0);});
$(window).scroll(function(){

    var percent = $(document).scrollTop() / (600);
    div2.css('opacity', percent);
});
...*/

$(window).on("load",function() {
  function fade(pageLoad) {
    var windowTop=$(window).scrollTop(), windowBottom=windowTop+$(window).innerHeight();
    var min=-1, max=1, threshold=0.01;

    $(".tile").each(function() {
      /* Check the location of each desired element */
      var objectHeight=$(this).outerHeight(), objectTop=$(this).offset().top, objectBottom=$(this).offset().top+objectHeight;

      /* Fade element in/out based on its visible percentage */
      if (objectTop < windowTop) {
        if (objectBottom > windowTop) {$(this).fadeTo(0,min+((max-min)*((objectBottom-windowTop)/objectHeight)));}
        else if ($(this).css("opacity")>=min+threshold || pageLoad) {$(this).fadeTo(0,min);}
      } else if (objectBottom > windowBottom) {
        if (objectTop < windowBottom) {$(this).fadeTo(0,min+((max-min)*((windowBottom-objectTop)/objectHeight)));}
        else if ($(this).css("opacity")>=min+threshold || pageLoad) {$(this).fadeTo(0,min);}
      } else if ($(this).css("opacity")<=max-threshold || pageLoad) {$(this).fadeTo(0,max);}
    });
  } fade(true); //fade elements on page-load
  $(window).scroll(function(){fade(false);}); //fade elements on scroll
});

