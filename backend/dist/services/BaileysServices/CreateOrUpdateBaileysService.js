"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Baileys_1 = __importDefault(require("../../models/Baileys"));
const createOrUpdateBaileysService = async ({ whatsappId, contacts, chats }) => {
    try {
        const baileysExists = await Baileys_1.default.findOne({
            where: { whatsappId }
        });
        if (baileysExists) {
            const getChats = baileysExists.chats
                ? JSON.parse(JSON.stringify(baileysExists.chats))
                : [];
            const getContacts = baileysExists.contacts
                ? JSON.parse(JSON.stringify(baileysExists.contacts))
                : [];
            if (chats) {
                getChats.push(...chats);
                getChats.sort();
                getChats.filter((v, i, a) => a.indexOf(v) === i);
            }
            if (contacts) {
                getContacts.push(...contacts);
                getContacts.sort();
                getContacts.filter((v, i, a) => a.indexOf(v) === i);
            }
            const newBaileys = await baileysExists.update({
                chats: JSON.stringify(getChats),
                contacts: JSON.stringify(getContacts)
            });
            return newBaileys;
        }
        const baileys = await Baileys_1.default.create({
            whatsappId,
            contacts: JSON.stringify(contacts),
            chats: JSON.stringify(chats)
        });
        return baileys;
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = createOrUpdateBaileysService;
