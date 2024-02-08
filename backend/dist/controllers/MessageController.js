"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = exports.remove = exports.store = exports.index = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const SetTicketMessagesAsRead_1 = __importDefault(require("../helpers/SetTicketMessagesAsRead"));
const socket_1 = require("../libs/socket");
const Queue_1 = __importDefault(require("../models/Queue"));
const User_1 = __importDefault(require("../models/User"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const QuickMessage_1 = __importDefault(require("../models/QuickMessage"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mime_types_1 = require("mime-types");
const ListMessagesService_1 = __importDefault(require("../services/MessageServices/ListMessagesService"));
const ShowTicketService_1 = __importDefault(require("../services/TicketServices/ShowTicketService"));
const DeleteWhatsAppMessage_1 = __importDefault(require("../services/WbotServices/DeleteWhatsAppMessage"));
const SendWhatsAppMedia_1 = __importDefault(require("../services/WbotServices/SendWhatsAppMedia"));
const SendWhatsAppMessage_1 = __importDefault(require("../services/WbotServices/SendWhatsAppMessage"));
const CheckNumber_1 = __importDefault(require("../services/WbotServices/CheckNumber"));
const sendFacebookMessageMedia_1 = require("../services/FacebookServices/sendFacebookMessageMedia");
const sendFacebookMessage_1 = __importDefault(require("../services/FacebookServices/sendFacebookMessage"));
const index = async (req, res) => {
    const { ticketId } = req.params;
    const { pageNumber } = req.query;
    const { companyId, profile } = req.user;
    const queues = [];
    if (profile !== "admin") {
        const user = await User_1.default.findByPk(req.user.id, {
            include: [{ model: Queue_1.default, as: "queues" }]
        });
        user.queues.forEach(queue => {
            queues.push(queue.id);
        });
    }
    const { count, messages, ticket, hasMore } = await (0, ListMessagesService_1.default)({
        pageNumber,
        ticketId,
        companyId,
        queues
    });
    if (ticket.channel === "whatsapp") {
        (0, SetTicketMessagesAsRead_1.default)(ticket);
    }
    return res.json({ count, messages, ticket, hasMore });
};
exports.index = index;
const store = async (req, res) => {
    const { ticketId } = req.params;
    const { body, quotedMsg } = req.body;
    const medias = req.files;
    const { companyId } = req.user;
    const ticket = await (0, ShowTicketService_1.default)(ticketId, companyId);
    const pattern = /^\s*\[(.*?)\]$/;
    const patternB = /\s*\*.*?\*/g;
    const checaQuick = body.replace(patternB, '');
    const matches = pattern.test(checaQuick);
    if (matches) {
        const extractedValue = pattern.exec(checaQuick)?.[1];
        //console.log(extractedValue); 
        try {
            const quickMessage = await QuickMessage_1.default.findOne({
                where: {
                    shortcode: extractedValue,
                    companyId: companyId,
                    userId: req.user.id,
                },
            });
            if (quickMessage) {
                const { mediaPath, mediaName } = quickMessage;
                //const filePath = path.resolve(`public/company${companyId}`, mediaPath);
                //const mediaX = await getMessageOptions(mediaName, filePath, companyId.toString());
                //console.log(media);
                const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "backend/public");
                console.log(publicFolder);
                const filePath = `${publicFolder}/${mediaPath}`;
                console.log(filePath);
                const mimeType = (0, mime_types_1.lookup)(filePath);
                console.log(mimeType);
                const fileData = fs_1.default.readFileSync(filePath);
                const fileStream = fs_1.default.createReadStream(filePath);
                const media = {
                    fieldname: 'medias',
                    originalname: mediaName,
                    encoding: '7bit',
                    mimetype: mimeType,
                    destination: publicFolder,
                    filename: mediaPath,
                    path: filePath,
                    size: fileData.length,
                    buffer: Buffer.alloc(0),
                    stream: fileStream
                };
                //console.log(media);
                const senting = (0, SendWhatsAppMedia_1.default)({ media, ticket });
                //console.log(senting);
                return res.send();
                //await SendWhatsAppMedia({ media, ticket });
            }
        }
        catch (error) {
            console.error("Error checking shortcode:", error);
            return null;
        }
    }
    const { channel } = ticket;
    if (channel === "whatsapp") {
        (0, SetTicketMessagesAsRead_1.default)(ticket);
    }
    if (medias) {
        if (channel === "whatsapp") {
            await Promise.all(medias.map(async (media) => {
                await (0, SendWhatsAppMedia_1.default)({ media, ticket });
            }));
        }
        if (["facebook", "instagram"].includes(channel)) {
            await Promise.all(medias.map(async (media) => {
                await (0, sendFacebookMessageMedia_1.sendFacebookMessageMedia)({ media, ticket });
            }));
        }
    }
    else {
        if (["facebook", "instagram"].includes(channel)) {
            console.log(`Checking if ${ticket.contact.number} is a valid ${channel} contact`);
            await (0, sendFacebookMessage_1.default)({ body, ticket, quotedMsg });
        }
        if (channel === "whatsapp") {
            await (0, SendWhatsAppMessage_1.default)({ body, ticket, quotedMsg });
        }
    }
    return res.send();
};
exports.store = store;
const remove = async (req, res) => {
    const { messageId } = req.params;
    const { companyId } = req.user;
    const message = await (0, DeleteWhatsAppMessage_1.default)(messageId);
    const io = (0, socket_1.getIO)();
    io.to(message.ticketId.toString()).emit(`company-${companyId}-appMessage`, {
        action: "update",
        message
    });
    return res.send();
};
exports.remove = remove;
const send = async (req, res) => {
    const { whatsappId } = req.params;
    const messageData = req.body;
    const medias = req.files;
    try {
        const whatsapp = await Whatsapp_1.default.findByPk(whatsappId);
        if (!whatsapp) {
            throw new Error("Não foi possível realizar a operação");
        }
        if (messageData.number === undefined) {
            throw new Error("O número é obrigatório");
        }
        const numberToTest = messageData.number;
        const body = messageData.body;
        const companyId = whatsapp.companyId;
        const CheckValidNumber = await (0, CheckNumber_1.default)(numberToTest, companyId);
        const number = CheckValidNumber.jid.replace(/\D/g, "");
        if (medias) {
            await Promise.all(medias.map(async (media) => {
                await req.app.get("queues").messageQueue.add("SendMessage", {
                    whatsappId,
                    data: {
                        number,
                        body: media.originalname,
                        mediaPath: media.path
                    }
                }, { removeOnComplete: true, attempts: 3 });
            }));
        }
        else {
            req.app.get("queues").messageQueue.add("SendMessage", {
                whatsappId,
                data: {
                    number,
                    body
                }
            }, { removeOnComplete: false, attempts: 3 });
        }
        return res.send({ mensagem: "Mensagem enviada" });
    }
    catch (err) {
        if (Object.keys(err).length === 0) {
            throw new AppError_1.default("Não foi possível enviar a mensagem, tente novamente em alguns instantes");
        }
        else {
            throw new AppError_1.default(err.message);
        }
    }
};
exports.send = send;
