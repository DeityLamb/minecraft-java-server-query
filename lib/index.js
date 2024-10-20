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
exports.query = void 0;
const motd_1 = require("./motd");
const socket_1 = __importDefault(require("./socket"));
const utils_1 = require("./utils");
/**
 * Fetch information of a Minecraft server. Returns a `Promise` with the information of the server as a `JavaStatusResponse` object, or throws an error if something happened with the socket, fetching the data or because of timeout.
 * @param {options} JavaStatusOptions Options for the query function
 * @returns {Promise<JavaStatusResponse>} Information of the server. Throws an error if something happens while getting the information
*/
function query(options) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Parse arguments
            options.port = (_a = options.port) !== null && _a !== void 0 ? _a : 25565;
            options.timeout = (_b = options.timeout) !== null && _b !== void 0 ? _b : 30000;
            // Start connection
            const connection = new socket_1.default({
                host: options.host,
                port: options.port,
                timeout: options.timeout
            });
            connection.init();
            const timeout = setTimeout(() => {
                connection.end();
                reject("Timeout");
            }, options.timeout);
            connection.on("error", (error) => {
                clearTimeout(timeout);
                reject(error);
            });
            // Handshake packet
            const handshakePacket = Buffer.concat([
                (0, utils_1.varIntBuffer)(0x00),
                (0, utils_1.varIntBuffer)(47),
                (0, utils_1.stringVarIntBuffer)(options.host),
                (0, utils_1.uInt16BEBuffer)(options.port),
                (0, utils_1.varIntBuffer)(1) // 1 for status, 2 for login
            ]);
            yield new Promise((resolve, reject) => {
                var _a;
                (_a = connection.socket) === null || _a === void 0 ? void 0 : _a.write((0, utils_1.prefixLength)(handshakePacket), (error) => {
                    if (error) {
                        clearTimeout(timeout);
                        reject(error);
                    }
                    resolve();
                });
            });
            // Request packet
            const requestPacket = Buffer.concat([(0, utils_1.varIntBuffer)(0x00)]);
            yield new Promise((resolve, reject) => {
                var _a;
                (_a = connection.socket) === null || _a === void 0 ? void 0 : _a.write((0, utils_1.prefixLength)(requestPacket), (error) => {
                    if (error) {
                        clearTimeout(timeout);
                        reject(error);
                    }
                    resolve();
                });
            });
            // Getting packet length, trimming the rest of the buffer and waiting for the full packet
            const packetLength = yield connection.readVarInt(() => connection.readUInt8());
            yield connection.waitUntilDataIsAvailable(packetLength);
            // Getting packet ID/type, that should be 0x00 always
            const type = yield connection.readVarInt(() => connection.readUInt8());
            if (type !== 0x00) {
                clearTimeout(timeout);
                reject("Invalid server response");
            }
            // Parsing the JSON response, disconnect socket and return final object
            const response = JSON.parse(yield connection.readStringVarInt());
            connection.end();
            clearTimeout(timeout);
            const result = Object.assign(Object.assign({}, response), { favicon: null });
            delete result.description;
            result.motd = (0, motd_1.toRaw)(response.description);
            if (response.favicon) {
                const parts = response.favicon.split(",");
                result.favicon = {
                    buffer: Buffer.from(parts[1], "base64"),
                    mimeType: parts[0].split(";")[0].replace("data:", "")
                };
            }
            resolve(result);
        }));
    });
}
exports.query = query;
