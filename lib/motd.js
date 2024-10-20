"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRaw = exports.MotdFormatCodes = exports.MotdColorCodes = void 0;
exports.MotdColorCodes = {
    "4": "dark_red",
    "c": "red",
    "6": "gold",
    "e": "yellow",
    "2": "dark_green",
    "a": "green",
    "b": "aqua",
    "3": "dark_aqua",
    "1": "dark_blue",
    "9": "blue",
    "d": "light_purple",
    "5": "dark_purple",
    "f": "white",
    "7": "gray",
    "8": "dark_gray",
    "0": "black",
    "g": "minecoin_gold"
};
exports.MotdFormatCodes = {
    "k": "obfuscated",
    "l": "bold",
    "m": "strikethrough",
    "n": "underlined",
    "o": "italic",
    "r": "reset"
};
function toRaw(motd, useAmpersand) {
    var _a;
    if (!motd)
        return "";
    if (typeof motd === "string")
        return motd;
    let text = ((_a = motd === null || motd === void 0 ? void 0 : motd.text) !== null && _a !== void 0 ? _a : "") + `${(useAmpersand ? "&" : "§")}r`;
    if (motd && motd.color) {
        const code = Object.keys(exports.MotdColorCodes).find(key => {
            return exports.MotdColorCodes[key] === motd.color;
        });
        text = (code ? (useAmpersand ? "&" : "§") + code : "") + text;
    }
    const formattingKeys = Object.keys(motd).filter(e => e !== "text" && e !== "extra" && e !== "color");
    if (formattingKeys) {
        const codes = formattingKeys.map(format => {
            return (useAmpersand ? "&" : "§") + Object.keys(exports.MotdFormatCodes).find(key => {
                return exports.MotdFormatCodes[key] === format;
            });
        });
        text = codes.join("") + text;
    }
    text = `${(useAmpersand ? "&" : "§")}r` + text;
    return (text) + (motd && motd.extra ? motd.extra.map((e) => toRaw(e)).join("") : "");
}
exports.toRaw = toRaw;
