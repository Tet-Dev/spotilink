[![npm](https://img.shields.io/npm/dt/spotilink)](https://npmjs.org/package/spotilink)
[![npm](https://img.shields.io/npm/v/spotilink?label=npm%20package)](https://npmjs.org/package/spotilink)
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat)](#contributors-)


# spotilink

A simple module to convert Spotify URLs into song titles for Lavalink to parse into track objects. No need to bother renewing your Spotify access token every time, because it will handle and renew your Spotify token for you.

### Prerequisites
- A Spotify app client. You can log in and create one in https://developer.spotify.com/dashboard
- Lavalink API https://github.com/Frederikam/Lavalink

### Installation
```javascript
// For npm
npm install spotilink

// For yarn
yarn add spotilink
```

### Simple Usage
```javascript
const { SpotifyParser } = require('spotilink');

const spotifyID = ''; // Your Spotify app client ID
const spotifySecret = ''; // Your Spotify app client secret
const node = {
	host: 'localhost',
	port: 1234,
	password: 'password'
};

const spotilink =  new SpotifyParser(node, spotifyID, spotifySecret);

// Get a song title
const song = await spotilink.getTrack('1Cv1YLb4q0RzL6pybtaMLo'); // { artists: [ "Surfaces" ], name: "Sunday Best" }

// Get all songs from an album
const album = await spotilink.getAlbumTracks('7tcs1X9pzFvcLOPuhCstQJ'); // [ { artists: [ "Kygo", "Valerie Broussard" ], name: "The Truth" }, ... ]

// Get all songs from a playlist
const playlist = await spotilink.getPlaylistTracks('37i9dQZEVXbMDoHDwVN2tF') // [ { arists: [ "Cardi B", "Megan Thee Stallion" ], name: "WAP (feat. Megan Thee Stallion)" }, ... ]

// Fetch song from the Lavalink API
const track = await spotilink.fetchTrack(song) // { track: "", info: {} }
				.catch(() => console.log("No track found."));

// Fetch songs from playlists from the Lavalink API
const tracks = [];
await Promise.all(album.map(async (name) => tracks.push(await spotilink.fetchTrack(name))));
// 'tracks' will now contain Lavalink track objects.
// SpotifyParser#fetchTrack will only return the track object, giving you complete freedom and control on how you handle the Lavalink tracks. :)
```
---

The following methods below, if `true` is passed as the second parameter, will call `Spotilink#fetchTrack` and return a Lavalink object (an array of them for getAlbumTracks and getPlaylistTracks) instead of song titles and artists.
```javascript
// Get a song in the form of a Lavalink object.
const lavalinkSong = await spotilink.getTrack('1Cv1YLb4q0RzL6pybtaMLo', true);
// Get all songs from an album in the form of an array of Lavalink objects.
const album = await spotilink.getAlbumTracks('7tcs1X9pzFvcLOPuhCstQJ', true);
// Get all songs from a playlist in the form of an array of Lavalink objects.
const playlist = await spotilink.getPlaylistTracks('37i9dQZEVXbMDoHDwVN2tF', true);
```
---

You can use custom functions to manipulate the search results.
For the three main methods used, you can pass an object containing the functions for filtering and sorting.
By default, no filtering and sorting takes place. This means that whichever the first track that Lavalink may have received will be returned.
```javascript
// Prioritize Lavalink tracks with the same duration as the Spotify track.
spotilink.getTrack('track ID', , { prioritizeSameDuration: true });

// Use a custom synchronous function for filtering search results
// The synchronous function being passed must return a boolean type variable
spotilink.getTrack('track ID', , { customFilter: (lavalinkTrack, spotifyTrack) => lavalinkTrack.info.title === spotifyTrack.name })

// Use a custom synchronous function for sorting search results
// The symchronous function being passed must return a number type variable
spotilink.getTrack('track ID', , { customSort: (comparableTrack, compareToTrack, spotifyTrack) => lavalinkTrack.info.title === spotifyTrack.name ? -1 : 1 })
```
Please note that if you use the option `prioritizeSameDuration`, the other options mentioned will be unused. The options `customFilter` and `customSort` however, may be used together as long as `prioritizeSameDuration` is set to `false`.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/TheFloppyBanana"><img src="https://avatars1.githubusercontent.com/u/35372554?v=4?s=100" width="100px;" alt=""/><br /><sub><b>TheFloppyBanana</b></sub></a><br /><a href="https://github.com/takomst/spotify-to-lavalink/commits?author=TheFloppyBanana" title="Code">💻</a> <a href="https://github.com/takomst/spotify-to-lavalink/commits?author=TheFloppyBanana" title="Documentation">📖</a> <a href="#example-TheFloppyBanana" title="Examples">💡</a> <a href="#ideas-TheFloppyBanana" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/Dwigoric"><img src="https://avatars2.githubusercontent.com/u/30539952?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dwigoric</b></sub></a><br /><a href="https://github.com/takomst/spotify-to-lavalink/commits?author=Dwigoric" title="Code">💻</a> <a href="#ideas-Dwigoric" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://xeval.dev/"><img src="https://avatars3.githubusercontent.com/u/40152105?v=4?s=100" width="100px;" alt=""/><br /><sub><b>X-49</b></sub></a><br /><a href="https://github.com/takomst/spotify-to-lavalink/issues?q=author%3ASaphirePI" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
