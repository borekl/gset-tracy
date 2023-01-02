(function() {

//------------------------------------------------------------------------------
// Pluralize nouns.
function pl(n, s)
{
  let pl;

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

  // thumbnail image, we are adding "ghost" src/srcset attributes to be
  // copied to real ones upon becoming visible (ie. lazy loading)
  let image = document.createElement('img');
  if('thumb' in info)
    image.setAttribute('data-src', info.thumb.src);
  if('srcset' in info.thumb)
    image.setAttribute('data-srcset', info.thumb.srcset);

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

  // container for the thumbnails
  let main = document.getElementsByClassName('main')[0];

  // remove no javascript notice
  document.getElementById("nojava").remove();

  // load set JSON file
  fetch("gset.json")
  .then(response => response.json())
  .then(data => {

    // create DOM elements for thumbnails
    data.dirs_order.forEach(key => {
      let thumb = thumbnail(key, data.dirs[key]);
      document.getElementsByClassName('main')[0].append(thumb);
    });

    // set up intersection observer instance and lazy loading code
    let observer = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          let t = entry.target.children[2];
          o.unobserve(t);
          if(t.hasAttribute('data-srcset'))
            t.setAttribute('srcset', t.getAttribute('data-srcset'));
          if(t.hasAttribute('data-src'))
            t.setAttribute('src', t.getAttribute('data-src'));
        }
      })
    });

    // set images for observing
    let thumbs = main.querySelectorAll('div.th');
    thumbs.forEach(t => observer.observe(t));
  });
});


})();
