var youtubedl = require('youtube-dl');
var readConfig = require('read-config');
var tv = require('tvdb.js');
var path = require('path');
var fetch = require('node-fetch');

class MediaFinder {
  constructor () {
    this._config = readConfig(path.join(__dirname, '../config.json'));
    tv = tv(this._config.TVDB_API_KEY);
  }

  getEpisodes (show) {
    return tv.find(show);
  }

  _searchVideos (query, mode) {
    // This is limited to only 3 hosts, because if you have more then the site doesn't filter by them
    if (mode == "download") {
      var hosts = "drive.google.com,filehoot.com,promptfile.com";
      // "cloudyvideos.com,drive.google.com,dropbox.com,filehoot.com,gigapeta.com,gigasize.com,oload.co,openload.co,openload.io,promptfile.com,slingfile.com,wholecloud.net,xfilesharing.us"
    } else {
      var hosts = "streamcloud.eu,vidzi.tv,thevideobee.to";
      // "abc.go.com,abcfamily.go.com,arte.tv,auroravid.to,biqle.ru,cloudtime.to,cloudyvideos.com,daclips.com,daclips.in,dailymotion.com,dramafever.com,drive.google.com,drtuber.com,empflix.com,espn.go.com,filehoot.com,filmon.com,fox.com,gorillavid.com,gorillavid.in,movpod.in,movpod.net,nosvideo.com,nowvideo.co,nowvideo.sx,nowvideo.to,oload.co,openload.co,openload.io,primeshare.tv,promptfile.com,promptfile.net,prosieben.de,rapidvideo.ws,shared.sx,southparkstudios.com,streamable.ch,streamcloud.eu,streamin.to,teamcoco.com,thevideobee.to,tnaflix.com,veehd.com,veoh.com,videoweed.com,videoweed.es,vidto.me,vidzi.tv,viewster.com,vimeo.com,vimple.ru,vivo.sx,vk.com,wholecloud.net,xvidstage.com,youtube.com,zdf.de"
    }

    return new Promise((resolve, reject) => {
      var url = `https://www.alluc.ee/api/search/${mode}/?apikey=${this._config.ALLUC_API_KEY}&query=${query}+host:${hosts}+lang:en&count=3`;
      fetch(url).then(response => {
        response.json().then(obj => {
          resolve(obj.result);
        });
      });
    });
  }

  search (show, episode) {
    return new Promise((resolve, reject) => {
      console.log("Beginning search for a stream");
      var query = `${show} ${episode}`.toLowerCase().replace(/%20/g, "+");
      Promise.all([this._searchVideos(query, 'download'), this._searchVideos(query, 'stream')]).then(results => {
        var allResults = results[0].concat(results[1]);
        var allPromises = allResults.map(result => {
          console.log("RESULT", result);
          return this._getVideoDownloadLink(result.hosterurls[0].url);
        });
        Promise.all(allPromises).then(vidLinks => {
          // Reduce the vidlinks array to only the valid ones
          vidLinks = vidLinks.reduce(function (acc, curr, i) {
            if (curr.url) {
              acc.push(curr);
            }
            return acc;
          }, []);

          // vidLinks[0].url
          resolve(vidLinks[0].url);
        });
      });
    });
  }

  _getVideoDownloadLink (url) {
    return new Promise(function (resolve, reject) {
      youtubedl.getInfo(url, function(err, info) {
        console.log("Trying to get a link for a video")
        if (err || !info) {
          console.log(err, info);
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


}

module.exports = { MediaFinder }
