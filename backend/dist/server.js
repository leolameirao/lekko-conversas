"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_graceful_shutdown_1 = __importDefault(require("http-graceful-shutdown"));
const node_cron_1 = __importDefault(require("node-cron"));
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./libs/socket");
const logger_1 = require("./utils/logger");
const StartAllWhatsAppsSessions_1 = require("./services/WbotServices/StartAllWhatsAppsSessions");
const Company_1 = __importDefault(require("./models/Company"));
const queues_1 = require("./queues");
const sendEmailDueDate_1 = require("./utils/sendEmailDueDate");
const wbotTransferTicketQueue_1 = require("./wbotTransferTicketQueue");
const server = app_1.default.listen(process.env.PORT, async () => {
    const companies = await Company_1.default.findAll();
    const allPromises = [];
    companies.map(async (c) => {
        const promise = (0, StartAllWhatsAppsSessions_1.StartAllWhatsAppsSessions)(c.id);
        allPromises.push(promise);
    });
    Promise.all(allPromises).then(() => {
        (0, queues_1.startQueueProcess)();
    });
    logger_1.logger.info(`Server started on port: ${process.env.PORT}`);
});
//CRON PARA DISPARO DO EMAIL DE VENCIMENTO
node_cron_1.default.schedule("0 8 * * *", async () => {
    try {
        await (0, sendEmailDueDate_1.sendEmailDueDate)();
    }
    catch (error) {
        logger_1.logger.error(error);
    }
});
node_cron_1.default.schedule("*/5 * * * * *", async () => {
    logger_1.logger.info(`serviço de transferencia de tickets iniciado`);
    await (0, wbotTransferTicketQueue_1.TransferTicketQueue)();
});
(0, socket_1.initIO)(server);
(0, http_graceful_shutdown_1.default)(server);
