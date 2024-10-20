/// <reference types="node" />
/// <reference types="node" />
import { Socket } from "node:net";
import { EventEmitter } from "node:events";
interface ModifiedTCPSocketOptions {
    host: string;
    port: number;
    timeout: number;
}
export default class ModifiedTCPSocket extends EventEmitter {
    host: string;
    port: number;
    timeout: number;
    private data;
    socket: Socket | null;
    constructor(options: ModifiedTCPSocketOptions);
    init(): void;
    waitUntilDataIsAvailable(length: number): Promise<void>;
    readVarInt(readByte: () => Promise<number>): Promise<number>;
    readUInt8(): Promise<number>;
    readStringVarInt(): Promise<string>;
    end(): void;
}
export {};
