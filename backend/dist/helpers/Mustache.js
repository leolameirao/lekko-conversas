"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.greeting = void 0;
const mustache_1 = __importDefault(require("mustache"));
const format_1 = __importDefault(require("date-fns/format"));
const greeting = () => {
    const greetings = ["Boa madrugada", "Bom dia", "Boa tarde", "Boa noite"];
    const h = new Date().getHours();
    // eslint-disable-next-line no-bitwise
    return greetings[(h / 6) >> 0];
};
exports.greeting = greeting;
const firstname = (name) => {
    if (name) {
        const nameArr = name.split(' ');
        return nameArr[0];
    }
    return '';
};
exports.default = (body, contact) => {
    let ms = "";
    const Hr = new Date();
    const dd = `0${Hr.getDate()}`.slice(-2);
    const mm = `0${Hr.getMonth() + 1}`.slice(-2);
    const yy = Hr.getFullYear().toString();
    const hh = Hr.getHours();
    const min = `0${Hr.getMinutes()}`.slice(-2);
    const ss = `0${Hr.getSeconds()}`.slice(-2);
    if (hh >= 6) {
        ms = "Bom dia";
    }
    if (hh > 11) {
        ms = "Boa tarde";
    }
    if (hh > 18) {
        ms = "Boa noite";
    }
    if (hh > 23 || hh < 6) {
        ms = "Boa madrugada";
    }
    const today = (0, format_1.default)(new Date(), "dd/MM/yyyy").replace(/\//g, '/');
    const protocol = yy + mm + dd + String(hh) + min + ss;
    const hora = `${hh}:${min}:${ss}`;
    console.log("protocol", (0, format_1.default)(new Date(), "dd/MM/yyyy"));
    const view = {
        name: contact ? contact.name : "",
        greeting: (0, exports.greeting)(),
        ms,
        protocol,
        hora,
        today,
        firstname: firstname(contact ? contact.name : ""),
    };
    return mustache_1.default.render(body, view);
};
