import fetch from "node-fetch";
import { URLSearchParams } from "url";

const BASE_URL = "https://api.spotify.com/v1";

export interface Node {
	host: string;
	port: string;
	password: string;
}

export interface Album {
	items: SpotifyTrack[];
}

export interface Artist {
	name: string;
}

export interface LavalinkTrack {
	track: string;
	info: {
		identifier: string;
		isSeekable: boolean;
		author: string;
		length: number;
		isStream: boolean;
		position: number;
		title: string;
		uri: string;
	}
}

export interface LavalinkSearchResult {
	tracks: LavalinkTrack[];
}

export interface PlaylistItems {
	items: [{
		track: SpotifyTrack;
	}];
}

export interface PlaylistInfo {
	tracks: {
		total: number;
	}
}

export interface SpotifyTrack {
	artists: Artist[];
	name: string;
	duration_ms: number;
}


/**
 * @typedef FetchOptions
 * @name FetchOptions
 * @type {object}
 * @property {boolean} prioritizeSameDuration - Whether to prioritize Lavalink tracks with the same duration as the Spotify track.
 */
export interface FetchOptions {
	prioritizeSameDuration: boolean;
	/**
	 * @param lavalinkTrack The Lavalink track for each result. Changes each iteration.
	 * @param spotifyTrack The Spotify track equivalent to the Lavalink track. Changes each iteration.
	 * @returns {boolean} A boolean result of the compare function, whether the Lavalink track stays or is discarded.
	 */
	customFilter(lavalinkTrack: LavalinkTrack, spotifyTrack: SpotifyTrack): boolean;
	/**
	 * 
	 * @param comparableTrack The Lavalink track being compared to the other Lavalink tracks. Changes each iteration.
	 * @param compareToTrack The other Lavalink track that the comparable Lavalink track is being compared to. Note that the function is run against each of the other Lavalink tracks.
	 * @param spotifyTrack The Spotify track equivalent to the comparable Lavalink track that you can use to compare the Lavalink tracks with each other. Changes each iteration.
	 * @returns {number} A number that defines the position of the comparableTrack in the results. The track moves to the first if a negative number is returned, 0 if it would stay at the same position with respect to the other tracks, and a positive number if it would move to the end.
	 */
	customSort(comparableTrack: LavalinkTrack, compareToTrack: LavalinkTrack, spotifyTrack: SpotifyTrack): number;
}


export class SpotifyParser {
	public nodes: Node;
	private authorization: string;
	private token: string;
	private options: { headers: { "Content-Type": string; Authorization: string; }; };

	/**
	 * A class to convert Spotify URLs into Lavalink track objects.
	 * @param {Node} Node A lavalink node to expose the lavalink API
	 * @param {string} clientID Your Spotify's client ID.
	 * @param {string} clientSecret Your Spotify's client secret.
	 */
	constructor(LavalinkNode: Node, clientID: string, clientSecret: string) {
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
	public async getAlbumTracks(id: string, convert = false, fetchOptions: FetchOptions): Promise<LavalinkTrack[]|SpotifyTrack[]> {
		if (!id) throw new ReferenceError("The album ID was not provided");
		if (typeof id !== "string") throw new TypeError(`The album ID must be a string, received type ${typeof id}`);

		const { items }: Album = (await (await fetch(`${BASE_URL}/albums/${id}/tracks`, this.options)).json());

		if (convert) return Promise.all(items.map(async (item) => await this.fetchTrack(item, fetchOptions)) as unknown as LavalinkTrack[]);
		return items;
	}

	/**
	 * Fetch the tracks from the album and return the SpotifyTrack or LavalinkTrack objects.
	 * @param {string} id The album ID.
	 * @param {boolean} convert Whether to return results as LavalinkTrack objects instead of SpotifyTrack objects.
	 * @param {FetchOptions} fetchOptions An object containing the options for fetching Lavalink tracks with the Spotify tracks.
	 * @returns {Promise<LavalinkTrack[]|SpotifyTrack[]>} The promisified array of the tracks in the playlist, in the form of a Lavalink Track object (if converted) or a Spotify Track object.
	 */
	public async getPlaylistTracks(id: string, convert = false, fetchOptions: FetchOptions): Promise<LavalinkTrack[]|SpotifyTrack[]> {
		if (!id) throw new ReferenceError("The playlist ID was not provided");
		if (typeof id !== "string") throw new TypeError(`The playlist ID must be a string, received type ${typeof id}`);

		const playlistInfo: PlaylistInfo = await (await fetch(`${BASE_URL}/playlists/${id}`, this.options)).json();
		const sets = Math.ceil(playlistInfo.tracks.total / 100);

		const items: PlaylistItems["items"] = [{ track: { artists: [], name: "", duration_ms: 0 } }];
		for (let set = 0; set < sets; set++) {
			const params = new URLSearchParams();
			params.set("limit", "100");
			params.set("offset", String(set * 100));
			if (set === 0) items.unshift();
			items.push(await (await fetch(`${BASE_URL}/playlists/${id}/tracks?${params}`, this.options)).json());
		}

		if (convert) return Promise.all(items.map(async (item) => await this.fetchTrack(item.track, fetchOptions).catch(er=>{})) as unknown as LavalinkTrack[]);
		return items.map(item => item.track);
	}

	/**
	 * Fetch the tracks from the album and return the SpotifyTrack or LavalinkTrack objects.
	 * @param {string} id The album ID.
	 * @param {boolean} convert Whether to return results as LavalinkTrack objects instead of SpotifyTrack objects.
	 * @param {FetchOptions} fetchOptions An object containing the options for fetching Lavalink tracks with the Spotify tracks.
	 * @returns {Promise<LavalinkTrack|SpotifyTrack>} The promisified Lavalink Track object (if converted) or the Spotify Track object.
	 */
	public async getTrack(id: string, convert = false, fetchOptions: FetchOptions): Promise<LavalinkTrack|SpotifyTrack> {
		if (!id) throw new ReferenceError("The track ID was not provided");
		if (typeof id !== "string") throw new TypeError(`The track ID must be a string, received type ${typeof id}`);

		const track: SpotifyTrack = (await (await fetch(`${BASE_URL}/tracks/${id}`, this.options)).json());

		if (convert) return this.fetchTrack(track, fetchOptions) as unknown as LavalinkTrack;
		return track;
	}

	/**
	 * Return a LavalinkTrack object from the SpotifyTrack object.
	 * @param {SpotifyTrack} track The SpotifyTrack object to be searched and compared against the Lavalink API
	 * @param {FetchOptions} fetchOptions An object containing the options for fetching Lavalink tracks with the Spotify tracks.
	 * @returns {Promise<LavalinkTrack|null>} The promisified Lavalink Track object, or null if no match found.
	 */
	public async fetchTrack(track: SpotifyTrack, fetchOptions = { prioritizeSameDuration: false, customFilter: () => true, customSort: () => 0 } as FetchOptions): Promise<LavalinkTrack|null> {
		if (!track) throw new ReferenceError("The Spotify track object was not provided");
		if (!track.artists) throw new ReferenceError("The track artists array was not provided");
		if (!track.name) throw new ReferenceError("The track name was not provided");
		if (!Array.isArray(track.artists)) throw new TypeError(`The track artists must be an array, received type ${typeof track.artists}`);
		if (typeof track.name !== "string") throw new TypeError(`The track name must be a string, received type ${typeof track.name}`);

		const title = `${track.name} ${track.artists[0].name} description:("Auto-generated by YouTube.")`;

		const params = new URLSearchParams();
		params.append("identifier", `ytsearch: ${title}`);

		const { host, port, password } = this.nodes;
		const { tracks } = await (await fetch(`http://${host}:${port}/loadtracks?${params}`, {
			headers: {
				Authorization: password
			}
		})).json() as LavalinkSearchResult;

		if (!tracks.length) return null;

		if (fetchOptions.prioritizeSameDuration) {
			const sameDuration = tracks.filter(searchResult => (searchResult.info.length >= (track.duration_ms - 1500)) && (searchResult.info.length <= (track.duration_ms + 1500)))[0];
			if (sameDuration) return sameDuration;
		}

		if (typeof fetchOptions.customFilter === "undefined") fetchOptions.customFilter = () => true;
		if (typeof fetchOptions.customSort === "undefined") fetchOptions.customSort = () => 0;

		return tracks
			.filter(searchResult => fetchOptions.customFilter(searchResult, track))
			.sort((comparableTrack, compareToTrack) => fetchOptions.customSort(comparableTrack, compareToTrack, track))[0];
	}

	private async renewToken(): Promise<number> {
		const { access_token, expires_in } = await (await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			body: "grant_type=client_credentials",
			headers: {
				Authorization: `Basic ${this.authorization}`,
				"Content-Type": "application/x-www-form-urlencoded"
			}
		})).json();

		if (!access_token) throw new Error("Invalid Spotify client.");

		this.token = `Bearer ${access_token}`;
		this.options.headers.Authorization = this.token;

		// Convert expires_in into ms
		return expires_in * 1000;
	}

	private async renew(): Promise<void> {
		setTimeout(this.renew.bind(this), await this.renewToken());
	}

}
