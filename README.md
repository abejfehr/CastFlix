# CastFlix

A remote media center.

## The Problem

Putting movies on my TV is hard. Of course with the Netflix app on my Sony Smart TV I get a ton of great content, but unfortunately Canadian Netflix doesn't have a lot of the great titles available on American Netflix. Finding movies to stream online is pretty easy, but then I have to connect my computer to the television, even though I really wanted to use my computer while I watched movies. I could get a Raspberry Pi, put Kodi on it, and control it from my phone, but I _really_ hate the lack of responsiveness in Kodi on a Pi and the amount of steps it takes just to find content. Why can't I just see a library of great movies/shows and click on one and have it begin playing on my TV?

## The Solution

Meet CastFlix, a concoction of several APIs and plugins that became (somehow) a remote media center.

# How to Use

All you need to begin using this awful product is a Chromecast(or Chromecast-enabled TV), an ALLUC API key, and a TVDB API key.

Place those files in a file in the root of this repo called `config.json` which looks something like this:

    {
      "ALLUC_API_KEY": "abc1234",
      "TVDB_API_KEY": "def5678"
    }

To install the node modules required, type `npm install` at the root of the directory. To start, type `npm start` and visit [http://localhost:3000](http://localhost:3000) in the browser to begin browsing shows.

# How do I add shows?

Adding shows on the home screen is a bit of a manual process. I'll let you in on a secret though: the magic is actually all in the URL. When you're on a page like [http://localhost:3000/bob's%20burgers](http://localhost:3000/bob's%20burgers), just type the name of your show in place of "bob's burgers" and it'll _probably_ work. In case there's multiple ways to spell it, check it out on [thetvdb.com](http://thetvdb.com/)
