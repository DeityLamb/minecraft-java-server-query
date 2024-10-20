/// <reference types="node" />
/**
 * Options for the query function
 * @interface JavaStatusOptions
*/
interface JavaStatusOptions {
    /** IP address of the server */
    host: string;
    /** Port of the server. Defaults to `25565` */
    port?: number;
    /** Maximum time in milliseconds to disconnect due to inactivity. Defaults to `30_000` */
    timeout?: number;
}
/**
 * Response from a Minecraft Java server
 * @interface JavaStatusResponse
*/
interface JavaStatusResponse {
    /** Information about the version of Minecraft that the server is running */
    version: {
        protocol: number;
        name: string;
    };
    /** Online players, maximum amount of players that the server is capable of having, and an optional sample of players that are online (missing most of the times) */
    players: {
        max: number;
        online: number;
        sample?: {
            name: string;
            id: string;
        }[];
    };
    /** MOTD (Message of the day) of the server */
    motd: string;
    /** Buffer and Media type (Mime type) of the server's icon/image */
    favicon: {
        buffer: Buffer;
        mimeType: string;
    } | null;
}
/**
 * Fetch information of a Minecraft server. Returns a `Promise` with the information of the server as a `JavaStatusResponse` object, or throws an error if something happened with the socket, fetching the data or because of timeout.
 * @param {options} JavaStatusOptions Options for the query function
 * @returns {Promise<JavaStatusResponse>} Information of the server. Throws an error if something happens while getting the information
*/
declare function query(options: JavaStatusOptions): Promise<JavaStatusResponse>;
export { query, JavaStatusOptions, JavaStatusResponse };
