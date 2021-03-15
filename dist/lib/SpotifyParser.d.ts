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
    };
}
export interface LavalinkSearchResult {
    tracks: LavalinkTrack[];
}
export interface PlaylistItems {
    items: [
        {
            track: SpotifyTrack;
        }
    ];
}
export interface PlaylistInfo {
    tracks: {
        total: number;
    };
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
export declare class SpotifyParser {
    nodes: Node;
    private authorization;
    private token;
    private options;
    /**
     * A class to convert Spotify URLs into Lavalink track objects.
     * @param {Node} Node A lavalink node to expose the lavalink API
     * @param {string} clientID Your Spotify's client ID.
     * @param {string} clientSecret Your Spotify's client secret.
     */
    constructor(LavalinkNode: Node, clientID: string, clientSecret: string);
    /**
     * Fetch the tracks from the album and return the SpotifyTrack or LavalinkTrack objects.
     * @param {string} id The album ID.
     * @param {boolean} convert Whether to return results as LavalinkTrack objects instead of SpotifyTrack objects.
     * @param {FetchOptions} fetchOptions An object containing the options for fetching Lavalink tracks with the Spotify tracks.
     * @returns {Promise<LavalinkTrack[]|SpotifyTrack[]>} The promisified array of the tracks in the album, in the form of a Lavalink Track object (if converted) or a Spotify Track object.
     */
    getAlbumTracks(id: string, convert: boolean | undefined, fetchOptions: FetchOptions): Promise<LavalinkTrack[] | SpotifyTrack[]>;
    /**
     * Fetch the tracks from the album and return the SpotifyTrack or LavalinkTrack objects.
     * @param {string} id The album ID.
     * @param {boolean} convert Whether to return results as LavalinkTrack objects instead of SpotifyTrack objects.
     * @param {FetchOptions} fetchOptions An object containing the options for fetching Lavalink tracks with the Spotify tracks.
     * @returns {Promise<LavalinkTrack[]|SpotifyTrack[]>} The promisified array of the tracks in the playlist, in the form of a Lavalink Track object (if converted) or a Spotify Track object.
     */
    getPlaylistTracks(id: string, convert: boolean | undefined, fetchOptions: FetchOptions): Promise<LavalinkTrack[] | SpotifyTrack[]>;
    /**
     * Fetch the tracks from the album and return the SpotifyTrack or LavalinkTrack objects.
     * @param {string} id The album ID.
     * @param {boolean} convert Whether to return results as LavalinkTrack objects instead of SpotifyTrack objects.
     * @param {FetchOptions} fetchOptions An object containing the options for fetching Lavalink tracks with the Spotify tracks.
     * @returns {Promise<LavalinkTrack|SpotifyTrack>} The promisified Lavalink Track object (if converted) or the Spotify Track object.
     */
    getTrack(id: string, convert: boolean | undefined, fetchOptions: FetchOptions): Promise<LavalinkTrack | SpotifyTrack>;
    /**
     * Return a LavalinkTrack object from the SpotifyTrack object.
     * @param {SpotifyTrack} track The SpotifyTrack object to be searched and compared against the Lavalink API
     * @param {FetchOptions} fetchOptions An object containing the options for fetching Lavalink tracks with the Spotify tracks.
     * @returns {Promise<LavalinkTrack|null>} The promisified Lavalink Track object, or null if no match found.
     */
    fetchTrack(track: SpotifyTrack, fetchOptions?: FetchOptions): Promise<LavalinkTrack | null>;
    private renewToken;
    private renew;
}
//# sourceMappingURL=SpotifyParser.d.ts.map