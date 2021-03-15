"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyParser = void 0;
const node_fetch_1 = require("node-fetch");
const url_1 = require("url");
const BASE_URL = "https://api.spotify.com/v1";
class SpotifyParser {
    /**
     * A class to convert Spotify URLs into Lavalink track objects.
     * @param {Node} Node A lavalink node to expose the lavalink API
     * @param {string} clientID Your Spotify's client ID.
     * @param {string} clientSecret Your Spotify's client secret.
     */
    constructor(LavalinkNode, clientID, clientSecret) {
        this.nodes = LavalinkNode;
        this.authorization = Buffer.from(`${clientID}:${clientSecret}`).toString("base64");
        this.token = "";
        this.options = {
            headers: {
                "Content-Type": "application/json",
                Authorization: this.token
            }
        };
        this.renew();
    }
    /**
     * Fetch the tracks from the album and return the SpotifyTrack or LavalinkTrack objects.
     * @param {string} id The album ID.
     * @param {boolean} convert Whether to return results as LavalinkTrack objects instead of SpotifyTrack objects.
     * @param {FetchOptions} fetchOptions An object containing the options for fetching Lavalink tracks with the Spotify tracks.
     * @returns {Promise<LavalinkTrack[]|SpotifyTrack[]>} The promisified array of the tracks in the album, in the form of a Lavalink Track object (if converted) or a Spotify Track object.
     */
    async getAlbumTracks(id, convert = false, fetchOptions) {
        if (!id)
            throw new ReferenceError("The album ID was not provided");
        if (typeof id !== "string")
            throw new TypeError(`The album ID must be a string, received type ${typeof id}`);
        const { items } = (await (await node_fetch_1.default(`${BASE_URL}/albums/${id}/tracks`, this.options)).json());
        if (convert)
            return Promise.all(items.map(async (item) => await this.fetchTrack(item, fetchOptions)));
        return items;
    }
    /**
     * Fetch the tracks from the album and return the SpotifyTrack or LavalinkTrack objects.
     * @param {string} id The album ID.
     * @param {boolean} convert Whether to return results as LavalinkTrack objects instead of SpotifyTrack objects.
     * @param {FetchOptions} fetchOptions An object containing the options for fetching Lavalink tracks with the Spotify tracks.
     * @returns {Promise<LavalinkTrack[]|SpotifyTrack[]>} The promisified array of the tracks in the playlist, in the form of a Lavalink Track object (if converted) or a Spotify Track object.
     */
    async getPlaylistTracks(id, convert = false, fetchOptions) {
        if (!id)
            throw new ReferenceError("The playlist ID was not provided");
        if (typeof id !== "string")
            throw new TypeError(`The playlist ID must be a string, received type ${typeof id}`);
        const playlistInfo = await (await node_fetch_1.default(`${BASE_URL}/playlists/${id}`, this.options)).json();
        const sets = Math.ceil(playlistInfo.tracks.total / 100);
        const items = [{ track: { artists: [], name: "", duration_ms: 0 } }];
        for (let set = 0; set < sets; set++) {
            const params = new url_1.URLSearchParams();
            params.set("limit", "100");
            params.set("offset", String(set * 100));
            if (set === 0)
                items.unshift();
            items.push(await (await node_fetch_1.default(`${BASE_URL}/playlists/${id}/tracks?${params}`, this.options)).json());
        }
        if (convert)
            return Promise.all(items.map(async (item) =>{
                let retres = null;
                try{
                    return await this.fetchTrack(item.track, fetchOptions);
                }catch(er){
                    console.trace(er);
                    return null;
                }
            } ));
        return items.map(item => item.track);
    }
    /**
     * Fetch the tracks from the album and return the SpotifyTrack or LavalinkTrack objects.
     * @param {string} id The album ID.
     * @param {boolean} convert Whether to return results as LavalinkTrack objects instead of SpotifyTrack objects.
     * @param {FetchOptions} fetchOptions An object containing the options for fetching Lavalink tracks with the Spotify tracks.
     * @returns {Promise<LavalinkTrack|SpotifyTrack>} The promisified Lavalink Track object (if converted) or the Spotify Track object.
     */
    async getTrack(id, convert = false, fetchOptions) {
        if (!id)
            throw new ReferenceError("The track ID was not provided");
        if (typeof id !== "string")
            throw new TypeError(`The track ID must be a string, received type ${typeof id}`);
        const track = (await (await node_fetch_1.default(`${BASE_URL}/tracks/${id}`, this.options)).json());
        if (convert)
            return this.fetchTrack(track, fetchOptions);
        return track;
    }
    /**
     * Return a LavalinkTrack object from the SpotifyTrack object.
     * @param {SpotifyTrack} track The SpotifyTrack object to be searched and compared against the Lavalink API
     * @param {FetchOptions} fetchOptions An object containing the options for fetching Lavalink tracks with the Spotify tracks.
     * @returns {Promise<LavalinkTrack|null>} The promisified Lavalink Track object, or null if no match found.
     */
    async fetchTrack(track, fetchOptions = { prioritizeSameDuration: false, customFilter: () => true, customSort: () => 0 }) {
        if (!track)
            throw new ReferenceError("The Spotify track object was not provided");
        if (!track.artists)
            throw new ReferenceError("The track artists array was not provided");
        if (!track.name)
            throw new ReferenceError("The track name was not provided");
        if (!Array.isArray(track.artists))
            throw new TypeError(`The track artists must be an array, received type ${typeof track.artists}`);
        if (typeof track.name !== "string")
            throw new TypeError(`The track name must be a string, received type ${typeof track.name}`);
        const title = `${track.name} ${track.artists[0].name} description:("Auto-generated by YouTube.")`;
        const params = new url_1.URLSearchParams();
        params.append("identifier", `ytsearch: ${title}`);
        const { host, port, password } = this.nodes;
        const { tracks } = await (await node_fetch_1.default(`http://${host}:${port}/loadtracks?${params}`, {
            headers: {
                Authorization: password
            }
        })).json();
        if (!tracks.length)
            return null;
        if (fetchOptions.prioritizeSameDuration) {
            const sameDuration = tracks.filter(searchResult => (searchResult.info.length >= (track.duration_ms - 1500)) && (searchResult.info.length <= (track.duration_ms + 1500)))[0];
            if (sameDuration)
                return sameDuration;
        }
        if (typeof fetchOptions.customFilter === "undefined")
            fetchOptions.customFilter = () => true;
        if (typeof fetchOptions.customSort === "undefined")
            fetchOptions.customSort = () => 0;
        return tracks
            .filter(searchResult => fetchOptions.customFilter(searchResult, track))
            .sort((comparableTrack, compareToTrack) => fetchOptions.customSort(comparableTrack, compareToTrack, track))[0];
    }
    async renewToken() {
        const { access_token, expires_in } = await (await node_fetch_1.default("https://accounts.spotify.com/api/token", {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${this.authorization}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })).json();
        if (!access_token)
            throw new Error("Invalid Spotify client.");
        this.token = `Bearer ${access_token}`;
        this.options.headers.Authorization = this.token;
        // Convert expires_in into ms
        return expires_in * 1000;
    }
    async renew() {
        setTimeout(this.renew.bind(this), await this.renewToken());
    }
}
exports.SpotifyParser = SpotifyParser;
