"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translations = exports.getBaseLanguage = void 0;
var en_US_json5_1 = require("./lang/en-US.json5");
var de_json_1 = require("./lang/de.json");
var el_json_1 = require("./lang/el.json");
var es_json_1 = require("./lang/es.json");
var fa_json_1 = require("./lang/fa.json");
var he_json_1 = require("./lang/he.json");
var ja_json_1 = require("./lang/ja.json");
var ko_json_1 = require("./lang/ko.json");
var nb_json_1 = require("./lang/nb.json");
var nn_json_1 = require("./lang/nn.json");
var pt_BR_json_1 = require("./lang/pt-BR.json");
var th_json_1 = require("./lang/th.json");
var tr_json_1 = require("./lang/tr.json");
var zh_Hans_json_1 = require("./lang/zh-Hans.json");
var zh_TW_json_1 = require("./lang/zh-TW.json");
// returns baseLANG from baseLANG-REGION if REGION exists
// this will, for example, convert en-US to en
var getBaseLanguage = function (langKey) {
    return langKey.split("-")[0];
};
exports.getBaseLanguage = getBaseLanguage;
var languageFiles = [
    { key: 'de', contents: de_json_1.default }, // German
    { key: 'el', contents: el_json_1.default }, // Greek
    { key: 'en-US', contents: en_US_json5_1.default }, // US English
    { key: 'es', contents: es_json_1.default }, // Spanish
    { key: 'fa', contents: fa_json_1.default }, // Farsi (Persian)
    { key: 'he', contents: he_json_1.default }, // Hebrew
    { key: 'ja', contents: ja_json_1.default }, // Japanese
    { key: 'ko', contents: ko_json_1.default }, // Korean
    { key: 'nb', contents: nb_json_1.default }, // Norwegian Bokmål
    { key: 'nn', contents: nn_json_1.default }, // Norwegian Nynorsk
    { key: 'pt-BR', contents: pt_BR_json_1.default }, // Brazilian Portuguese
    { key: 'th', contents: th_json_1.default }, // Thai
    { key: 'tr', contents: tr_json_1.default }, // Turkish
    { key: 'zh-Hans', contents: zh_Hans_json_1.default }, // Simplified Chinese
    { key: 'zh-TW', contents: zh_TW_json_1.default } // Traditional Chinese (Taiwan)
];
exports.translations = {};
languageFiles.forEach(function (langFile) {
    exports.translations[langFile.key] = langFile.contents;
    // accept full key with region code or just the language code
    var bLang = (0, exports.getBaseLanguage)(langFile.key);
    if (bLang && !exports.translations[bLang]) {
        exports.translations[bLang] = langFile.contents;
    }
});
