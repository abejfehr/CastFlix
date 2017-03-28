var links = document.querySelectorAll('a');

var makeLink = function (url) {
  return function (e) {
    e.preventDefault();
    e.stopPropagation();
    fetch(url, {
      method: 'POST',
    }).then(function(response) {
      response.json().then(function (obj) {
        if (obj.message) {
          alert(obj.message);
        }
        if (obj.url) {
          location.href = obj.url;
        }
        if (obj.redirect) {
          location.href = obj.redirect;
        }
      });
    });
  }
}

for (let link of links) {
  var url = link.getAttribute('data-href');
  if (url) {
    link.addEventListener('click', makeLink(url));
  }
}
