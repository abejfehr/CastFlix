// API Keys

var path = require('path');
var jade = require('jade');

const { Router } = require('@marshallofsound/electron-router');

const { Cast } = require('./src/Cast');
const { MediaFinder } = require('./src/MediaFinder');

var cast = new Cast();
var mediaFinder = new MediaFinder();

var window = undefined;

const router = new Router('media');

router.get('/', (req, res, next) => {
  res.render('index', { title: 'CastFlix' });
});

router.get('home', (req, res) => {
  window.webContents.send('start-loading');
  var theHTML = jade.renderFile(path.join(__dirname, 'views/index.jade'), {
    resolve: f => path.join(__dirname, f),
  });
  res.json({
    html: theHTML
  });
  window.webContents.send('stop-loading');
});

router.get('/show/:show', function (req, res, next) {
  window.webContents.send('start-loading');
  mediaFinder.getEpisodes(req.params.show).then((series) => {
    var episodes = series.episodes.filter(e => e.season != 0)
    var theHTML = jade.renderFile(path.join(__dirname, 'views/episodes.jade'), {
      resolve: f => path.join(__dirname, f),
      show: req.params.show,
      episodes,
      series,
      title: series.name,
    });
    res.json({
      html: theHTML
    });
    window.webContents.send('stop-loading');
  }).catch(err => console.error(err)) // Failed to fetch the series

});

router.post('/show/:show/:episode', function(req, res, next) {
  window.webContents.send('start-loading', "Finding Media");
  mediaFinder.search(req.params.show, req.params.episode).then(url => {
    cast.play(url).then(() => {
      window.webContents.send('stop-loading');
    });
  });
});

module.exports = { router, setWindow: function (w) {
  window = w;
  cast.setWindow(w);
} };
