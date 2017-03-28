// API Keys

var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();
var path = require('path');

var ChromecastAPI = require('chromecast-api');
var browser = new ChromecastAPI.Browser();
var youtubedl = require('youtube-dl');

var readConfig = require('read-config');
var config = readConfig('config.json');

var tv = require('tvdb.js')(config.TVDB_API_KEY);

var theDevice = undefined; // The ChromeCast device we connect to

browser.on('deviceOn', function (device) {
  if (device.config.name.indexOf('Chrome') >= 0) {
    theDevice = device;
  }
});

router.get('/', function (req, res, next) {
  res.render('index', { title: 'CastFlix' });
});

router.get('/show/:show', function (req, res, next) {
  tv.find(req.params.show).then((series) => {
    var episodes = series.episodes.filter(e => e.season != 0)
    res.render('episodes', { show: req.params.show, episodes, series, title: series.name });
  }).catch(err => console.error(err)) // Failed to fetch the series
});

var sendError = function (res, message, url) {
  var x = {
    message,
  };
  if (url) {
    x.url = url;
  }
  res.send(x);
};

var searchVideos = function (query, mode) {
  // This is limited to only 3 hosts, because if you have more then the site doesn't filter by them
  if (mode == "download") {
    var hosts = "drive.google.com,filehoot.com,promptfile.com";
    // "cloudyvideos.com,drive.google.com,dropbox.com,filehoot.com,gigapeta.com,gigasize.com,oload.co,openload.co,openload.io,promptfile.com,slingfile.com,wholecloud.net,xfilesharing.us"
  } else {
    var hosts = "streamcloud.eu,vidzi.tv,thevideobee.to";
    // "abc.go.com,abcfamily.go.com,arte.tv,auroravid.to,biqle.ru,cloudtime.to,cloudyvideos.com,daclips.com,daclips.in,dailymotion.com,dramafever.com,drive.google.com,drtuber.com,empflix.com,espn.go.com,filehoot.com,filmon.com,fox.com,gorillavid.com,gorillavid.in,movpod.in,movpod.net,nosvideo.com,nowvideo.co,nowvideo.sx,nowvideo.to,oload.co,openload.co,openload.io,primeshare.tv,promptfile.com,promptfile.net,prosieben.de,rapidvideo.ws,shared.sx,southparkstudios.com,streamable.ch,streamcloud.eu,streamin.to,teamcoco.com,thevideobee.to,tnaflix.com,veehd.com,veoh.com,videoweed.com,videoweed.es,vidto.me,vidzi.tv,viewster.com,vimeo.com,vimple.ru,vivo.sx,vk.com,wholecloud.net,xvidstage.com,youtube.com,zdf.de"
  }

  return new Promise(function (resolve, reject) {
    fetch(`https://www.alluc.ee/api/search/${mode}/?apikey=${config.ALLUC_API_KEY}&query=${query}+host:${hosts}+lang:en&count=3`).then(function (response) {
      response.json().then(function (obj) {
        resolve(obj.result);
      });
    });
  });
}

router.post('/show/:show/:episode', function(req, res, next) {
  var query = encodeURIComponent(`${req.params.show} ${req.params.episode}`.toLowerCase()).replace(/%20/g, "+");
  Promise.all([searchVideos(query, 'download'), searchVideos(query, 'stream')]).then(function (results) {
    var allResults = results[0].concat(results[1]);
    var allPromises = allResults.map(function (result) {
      return getVideoDownloadLink(result.hosterurls[0].url);
    });
    Promise.all(allPromises).then(vidLinks => {
      // Reduce the vidlinks array to only the valid ones
      vidLinks = vidLinks.reduce(function (acc, curr, i) {
        if (curr.url) {
          acc.push(curr);
        }
        return acc;
      }, []);

      // Cast it
      if (!theDevice) {
        console.log("Something else went wrong");
      }
      theDevice.play(vidLinks[0].url, 0, function () {
        res.send("👍");
      });

    });
  });
});

var getVideoDownloadLink = function (url) {
  return new Promise(function (resolve, reject) {
    youtubedl.getInfo(url, function(err, info) {
      if (err || !info) {
        resolve({});
        return;
      }

      resolve({
        url: info.url,
        format: info.format_id,
      });

    });
  });
}

router.get('/captcha', function (req, res, next) {
  res.render('captcha', req.query);
});

router.post('/captcha_response', function(req, res, next) {
  ol.getDownloadLink({
    file: req.body.file,
    ticket: req.body.ticket,
    captcha_response: req.body.captcha_response,
  }).then(function (response) {
    theDevice.play(response.result.url, 0, function () {
      res.redirect('/');
    });
  });
});

module.exports = router;
