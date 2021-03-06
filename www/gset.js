/*===========================================================================*
  Event debouncing, taken from:
  https://remysharp.com/2010/07/21/throttling-function-calls
 *===========================================================================*/


function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}


/*===========================================================================*
  Pluralize nouns.
 *===========================================================================*/

 function pl(n, s)
{
  var pl;
  
  if(s == 'fotka') {
    if(n == 1) { pl = s; }
    else if(n > 1 && n < 5) { pl = 'fotky'; }
    else { pl = 'fotek'; }
  }
  
  if(s == 'video') {
    if(n == 1) { pl = 'video'; }
    else if(n > 1 && n < 5) { pl = 'videa'; }
    else { pl = 'videí'; }
  }
  
  return n + '&nbsp;' + pl;
}


/*===========================================================================*
  HTML for the thumbnail sans the image itself.
 *===========================================================================*/

 function html_thumb(id, info)
{
  var html = '';

  html = '<a class="th" href="' + id  + '/">';
  html += '<div class="th">';
  html += '<span class="cap">' + info.date + '</span>';
  html += '<span class="info">';
  if(info.images) { html += pl(info.images, 'fotka'); }
  if(info.videos && info.images) { html += '<br>'; }
  if(info.videos) { html += pl(info.videos, 'video'); }
  html += '</span></div></a>';

  return html;
}


/*===========================================================================*
  HTML for the thumbnail image.
 *===========================================================================*/

 function html_thumb_img(id, info)
{
  var attrs = [];

  if("thumb" in info) {
    attrs.push('src="' + info.thumb.src + '"');
    if("srcset" in info.thumb) {
      attrs.push('srcset="' + info.thumb.srcset + '"');
    }
  }
  return '<img ' + attrs.join(' ') + '>';
}


/*=========================================================================*/

$(document).ready(function()
{
  var 
    html,
    key,
    jq_a,
    loaded;         // count of already loaded thumbnails

  //--- remove no javascript notice
  	
  $('p#nojava').remove();

  //--- get set information from JSON file
  
  $.get("gset.json", function(data) {

  //--- count number of galleries
  
    loaded = data.dirs_order.length;

  //--- iterate over galleries, create DOM elements

    data.dirs_order.forEach(function(key) {  
      
      // create a thumbnail
      html = html_thumb(key, data.dirs[key]);
      jq_a = $(html);
      
      // setup the fade-out animation of the span.info
      jq_a.children('div')
      .on('mouseenter', function(evt) {
        $(this).children('span.info')
        .stop().css({'display':'inline', 'opacity':1});
      })
      .on('mouseleave', function(evt) {
        $(this).children('span.info')
        .animate({'opacity': 0}, 300, 'linear', function() {
          $(this).css({'display':'none', 'opacity': 1});
        });
      });

      // add thumbnail to DOM
      $('div.main').append(jq_a);
      
      // create the actual pictures
      if(jq_a.children('div').visible(true)) {
        html = html_thumb_img(key, data.dirs[key]);
        jq_a.children('div').append(html);
        loaded--;
      } else {
        jq_a.children('div').addClass('notloaded').attr('data-key', key);
      }
    });

    //--- define callback for loading the pictures
    // on resize/scroll events we go through every picture with .notloaded,
    // check its visibility and if it is visible, we load it and remove .notloaded;
    // if "loaded" counter reaches 0, we unbind the resize/scroll handler.
    
    var on_scroll = throttle(function() {
      $('div.main').find('.notloaded').each(function() {
        if($(this).visible(true)) {
          var k = $(this).attr('data-key');
          $(this).removeClass('notloaded');
          $(this).append(html_thumb_img(k, data.dirs[k]));
          loaded--;
        }
      });
      if(loaded == 0) {
        $(window).off('scroll');
        $(window).off('resize');
      }
    }, 200);
		
    $(window).on('scroll', on_scroll);
    $(window).on('resize', on_scroll);
  });
});
