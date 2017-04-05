const { rendererPreload } = require('@marshallofsound/electron-router');

rendererPreload();

var makePostLink = function (url) {
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

var makeGetLink = function (url) {
  return function (e) {
    e.preventDefault();
    e.stopPropagation();
    fetch(url, {
      method: 'GET',
    }).then(response => {
      response.json().then(obj => {
        var main = document.querySelector('main');
        main.innerHTML = obj.html

        var links = document.querySelectorAll('a');
        for (let link of links) {
          var postURL = link.getAttribute('data-post');
          if (postURL) {
            link.addEventListener('click', makePostLink(postURL));
          }
          var getURL = link.getAttribute('data-get');
          if (getURL) {
            link.addEventListener('click', makeGetLink(getURL));
          }
        }
      });
    });
  }
}

fetch('media://home').then(resp => resp.json()).then(obj => {
  var main = document.querySelector('main');
  main.innerHTML = obj.html

  var links = document.querySelectorAll('a');
  for (let link of links) {
    var postURL = link.getAttribute('data-post');
    if (postURL) {
      link.addEventListener('click', makePostLink(postURL));
    }
    var getURL = link.getAttribute('data-get');
    if (getURL) {
      link.addEventListener('click', makeGetLink(getURL));
    }
  }
});

var { ipcRenderer } = require('electron');

var selector = document.getElementById('chromecast-selector');

selector.addEventListener('change', e => {
  ipcRenderer.send('select-device', e.target.value);
});

ipcRenderer.on('update-devices', (event, devices) => {
  selector.innerHTML = '';
  console.log(devices);
  for (device of devices) {
    var option = document.createElement('option');
    option.value = device.name;
    option.innerHTML = device.name;
    if (device.selected) {
      option.setAttribute('selected', 'selected');
    }
    selector.appendChild(option);
  }
});

ipcRenderer.on('start-loading', (event, text) => {
  startLoading(text);
});

ipcRenderer.on('stop-loading', (event) => {
  stopLoading();
});


var startLoading = function (text) {
  var loader = document.getElementById('loader');
  loader.innerText = text || 'Loading';
  loader.style.opacity = 1;
};

var stopLoading = function () {
  var loader = document.getElementById('loader');
  loader.style.opacity = 0;
}
