(function() {

//------------------------------------------------------------------------------
// Event debouncing, taken from:
// https://remysharp.com/2010/07/21/throttling-function-calls
function throttle(fn, threshhold, scope)
{
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


//------------------------------------------------------------------------------
// Pluralize nouns.
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

  return n + '\u00a0' + pl;
}

//------------------------------------------------------------------------------
// generate and return single thumbnail element tree
function thumbnail(id, info)
{
  // caption, usually contains date
  let cap = document.createElement('span');
  cap.classList.add('cap');
  cap.textContent = info.date;

  // this says how many photos/videos gallery has
  let infoContent = [];

  if(info.images)
    infoContent.push(document.createTextNode(pl(info.images, 'fotka')));
  if(info.images && info.videos)
    infoContent.push(document.createElement('br'));
  if(info.videos)
    infoContent.push(document.createTextNode(pl(info.videos, 'video')));

  let imgInfo = document.createElement('span');
  imgInfo.classList.add('info');
  imgInfo.append(...infoContent);

  // thumbnail image
  let image = document.createElement('img');
  if('thumb' in info) image.setAttribute('src', info.thumb.src);
  if('srcset' in info.thumb) image.setAttribute('srcset', info.thumb.srcset);

  // encompassing DIV element that holds the text content and the image
  let thumb = document.createElement('div');
  thumb.classList.add('th');
  thumb.append(cap, imgInfo, image);

  // wrapping A element
  let a = document.createElement('a');
  a.setAttribute('href', id + '/');
  a.classList.add('th');
  a.append(thumb);

  return a;
}

/*=========================================================================*/

document.addEventListener("DOMContentLoaded", function() {

  var jq_a;

  // remove no javascript notice
  document.getElementById("nojava").remove();

  // load set JSON file
  fetch("gset.json")
  .then(response => response.json())
  .then(data => {

    // count number of galleries
    let loaded = data.dirs_order.length;

    // iterate over galleries, create DOM elements
    data.dirs_order.forEach(key => {

      // create a thumbnail
      let thumb = thumbnail(key, data.dirs[key]);
      document.getElementsByClassName('main')[0].append(thumb);

      // add thumbnail to DOM
      //$('div.main').append(jq_a);

      // create the actual pictures
      /*if(jq_a.children('div').visible(true)) {
        jq_a.children('div').append(
          html_thumb_img(key, data.dirs[key])
        ).attr('data-key', key);
        loaded--;
      } else {
        jq_a.children('div').addClass('notloaded').attr('data-key', key);
      }*/
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


})();
