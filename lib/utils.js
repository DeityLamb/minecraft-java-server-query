"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prefixLength = exports.uInt16BEBuffer = exports.stringVarIntBuffer = exports.varIntBuffer = void 0;
const util_1 = __importDefault(require("util"));
const encoder = new util_1.default.TextEncoder();
function varIntBuffer(num) {
    // Direct source:
    // https://github.com/chrisdickinson/varint/blob/master/encode.js
    const msb = 0x80;
    const msball = ~0x7F;
    const int32Length = Math.pow(2, 31);
    if (num > Number.MAX_SAFE_INTEGER)
        throw new RangeError("Number too big");
    let out = [];
    let offset = 0;
    while (num >= int32Length) {
        out[offset++] = (num & 0xff) | msb;
        num /= 128;
    }
    while (num & msball) {
        out[offset++] = (num & 0xff) | msb;
        num >>>= 7;
    }
    out[offset] = num | 0;
    return Buffer.from(out);
}
exports.varIntBuffer = varIntBuffer;
function stringVarIntBuffer(string) {
    const data = encoder.encode(string);
    return Buffer.concat([varIntBuffer(data.byteLength), data]);
}
exports.stringVarIntBuffer = stringVarIntBuffer;
function uInt16BEBuffer(number) {
    const buffer = Buffer.alloc(2);
    buffer.writeUint16BE(number);
    return buffer;
}
exports.uInt16BEBuffer = uInt16BEBuffer;
function prefixLength(buffer) {
    return Buffer.concat([varIntBuffer(buffer.byteLength), buffer]);
}
exports.prefixLength = prefixLength;
