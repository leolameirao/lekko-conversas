"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const ShowTicketService_1 = __importDefault(require("./ShowTicketService"));
const FindOrCreateATicketTrakingService_1 = __importDefault(require("./FindOrCreateATicketTrakingService"));
const Setting_1 = __importDefault(require("../../models/Setting"));
const FindOrCreateTicketService = async (contact, whatsappId, unreadMessages, companyId, groupContact) => {
    let ticket = await Ticket_1.default.findOne({
        where: {
            status: {
                [sequelize_1.Op.or]: ["open", "pending"]
            },
            contactId: groupContact ? groupContact.id : contact.id,
            companyId
        },
        order: [["id", "DESC"]]
    });
    if (ticket) {
        await ticket.update({ unreadMessages });
    }
    if (!ticket && groupContact) {
        ticket = await Ticket_1.default.findOne({
            where: {
                contactId: groupContact.id
            },
            order: [["updatedAt", "DESC"]]
        });
        if (ticket) {
            await ticket.update({
                status: "pending",
                userId: null,
                unreadMessages,
                companyId
            });
            await (0, FindOrCreateATicketTrakingService_1.default)({
                ticketId: ticket.id,
                companyId,
                whatsappId: ticket.whatsappId,
                userId: ticket.userId,
            });
        }
        const msgIsGroupBlock = await Setting_1.default.findOne({
            where: { key: "timeCreateNewTicket" }
        });
    }
    if (!ticket && !groupContact) {
        ticket = await Ticket_1.default.findOne({
            where: {
                // updatedAt: {
                //   [Op.between]: [+subHours(new Date(), 2), +new Date()]
                // },
                contactId: contact.id
            },
            order: [["updatedAt", "DESC"]]
        });
        if (ticket) {
            await ticket.update({
                status: "pending",
                userId: null,
                unreadMessages,
                companyId
            });
            await (0, FindOrCreateATicketTrakingService_1.default)({
                ticketId: ticket.id,
                companyId,
                whatsappId: ticket.whatsappId,
                userId: ticket.userId
            });
        }
    }
    if (!ticket) {
        ticket = await Ticket_1.default.create({
            contactId: groupContact ? groupContact.id : contact.id,
            status: "pending",
            isGroup: !!groupContact,
            unreadMessages,
            whatsappId,
            companyId
        });
        await (0, FindOrCreateATicketTrakingService_1.default)({
            ticketId: ticket.id,
            companyId,
            whatsappId,
            userId: ticket.userId
        });
    }
    else {
        await ticket.update({ whatsappId });
    }
    ticket = await (0, ShowTicketService_1.default)(ticket.id, companyId);
    return ticket;
};
exports.default = FindOrCreateTicketService;
