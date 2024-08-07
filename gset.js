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

  // thumbnail image
  let image = document.createElement('img');
  image.setAttribute('width', 128);
  image.setAttribute('height', 128);
  image.setAttribute('src', info.thumb.src);
  image.setAttribute('loading', 'lazy');

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

  });
});


})();
