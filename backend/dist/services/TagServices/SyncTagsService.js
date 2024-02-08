"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("../../libs/socket");
const Contact_1 = __importDefault(require("../../models/Contact"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const SyncTags = async ({ tags, ticketId }) => {
    const io = (0, socket_1.getIO)();
    const ticket = await Ticket_1.default.findByPk(ticketId, { include: [Tag_1.default] });
    const companyId = ticket?.companyId;
    const tagList = tags.map(t => ({ tagId: t.id, ticketId }));
    await TicketTag_1.default.destroy({ where: { ticketId } });
    await TicketTag_1.default.bulkCreate(tagList);
    const ticketReturn = await Ticket_1.default.findByPk(ticketId, { include: [Tag_1.default, Contact_1.default] });
    ticket?.reload();
    io.to(ticket.status)
        .to("notification")
        .to(ticketId.toString())
        .emit(`company-${companyId}-ticket`, {
        action: "tagUpdate",
        ticket: ticketReturn
    });
    return ticket;
};
exports.default = SyncTags;
