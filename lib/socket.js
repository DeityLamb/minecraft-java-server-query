"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_net_1 = require("node:net");
const node_events_1 = require("node:events");
const util_1 = __importDefault(require("util"));
const decoder = new util_1.default.TextDecoder();
class ModifiedTCPSocket extends node_events_1.EventEmitter {
    constructor(options) {
        super();
        this.data = Buffer.alloc(0);
        this.socket = null;
        this.host = options.host;
        this.port = options.port;
        this.timeout = options.timeout;
    }
    init() {
        if (this.port < 0 || this.port > 65536 || isNaN(this.port)) {
            this.emit("error", "Port out of range");
            return;
        }
        this.socket = (0, node_net_1.createConnection)({
            host: this.host,
            port: this.port,
            timeout: this.timeout
        });
        this.socket.on("data", (chunk) => {
            this.data = Buffer.concat([this.data, chunk]);
        });
        this.socket.on("close", () => {
            this.end();
            this.emit("error", "Socket closed");
        });
        this.socket.on("error", (err) => {
            this.end();
            this.emit("error", err);
        });
    }
    waitUntilDataIsAvailable(length) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve) => {
                var _a;
                if (this.data.byteLength >= length)
                    return resolve();
                const dataListener = () => {
                    var _a;
                    if (this.data.byteLength >= length) {
                        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.removeListener("data", dataListener);
                        resolve();
                    }
                };
                (_a = this.socket) === null || _a === void 0 ? void 0 : _a.on("data", dataListener);
            });
        });
    }
    readVarInt(readByte) {
        return __awaiter(this, void 0, void 0, function* () {
            // Direct source:
            // https://github.com/PassTheMayo/minecraft-server-util/blob/master/src/util/varint.ts
            let reads = 0;
            let result = 0;
            let read = 0;
            let value = 0;
            do {
                if (reads > 4)
                    throw new Error();
                read = yield readByte();
                value = (read & 0b01111111);
                result |= (value << (7 * reads));
                reads++;
                if (reads > 5)
                    throw new Error();
            } while ((read & 0b10000000) != 0);
            return result;
        });
    }
    readUInt8() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.waitUntilDataIsAvailable(1);
            const int = this.data.readUint8(0);
            this.data = this.data.subarray(1);
            return int;
        });
    }
    readStringVarInt() {
        return __awaiter(this, void 0, void 0, function* () {
            const length = yield this.readVarInt(() => this.readUInt8());
            yield this.waitUntilDataIsAvailable(length);
            const string = this.data.subarray(0, length);
            this.data = this.data.subarray(length);
            return decoder.decode(string);
        });
    }
    end() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.end();
            this.socket.destroy();
        }
    }
}
exports.default = ModifiedTCPSocket;
