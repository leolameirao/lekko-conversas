"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailDueDate = void 0;
const sequelize_1 = require("sequelize");
const SendMail_1 = require("../helpers/SendMail");
const Company_1 = __importDefault(require("../models/Company"));
const moment_1 = __importDefault(require("moment"));
const sendEmailDueDate = async () => {
    const companies = await Company_1.default.findAll({
        attributes: ['id', 'name', 'dueDate', 'email'],
        where: {
            status: true,
            id: {
                [sequelize_1.Op.not]: 1
            },
            [sequelize_1.Op.or]: [
                { email: { [sequelize_1.Op.not]: null } },
                { email: { [sequelize_1.Op.not]: '' } },
                { email: { [sequelize_1.Op.not]: "" } }
            ]
        },
        // logging: true
    });
    companies.map(async (c) => {
        moment_1.default.locale('pt-br');
        let dueDate;
        if (c.id === 1) {
            dueDate = '2999-12-31T00:00:00.000Z';
        }
        else {
            dueDate = c.dueDate;
        }
        const vencimento = (0, moment_1.default)(dueDate).format("DD/MM/yyyy");
        var diff = (0, moment_1.default)(dueDate).diff((0, moment_1.default)((0, moment_1.default)()).format());
        var dias = moment_1.default.duration(diff).asDays();
        try {
            if (c.email !== '') {
                if (Math.round(dias) === 5) {
                    const _email = {
                        to: c.email,
                        subject: `Sua mensalidade no WHATSAPP - Outlet das Tintas vence em 5 dias`,
                        text: `<div style="background-color: #f7f7f7; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <p>Prezado(a) cliente,</p>
            <p>Gostaríamos de lembrar que sua mensalidade no WHATSAPP - Outlet das Tintas está prestes a vencer em 5 dias (${vencimento}). Agradecemos por confiar em nossa plataforma de multiatendimento com chatbot para WhatsApp, e esperamos que ela esteja sendo útil para o seu negócio.</p>
            <p>Para garantir a continuidade dos serviços prestados pela nossa plataforma, pedimos que realize o pagamento da fatura na tela “Financeiro” na área de “Administração” dentro da plataforma.</p>
            <p>Se precisar de ajuda ou tiver alguma dúvida durante a utilização da plataforma, não hesite em entrar em contato conosco através do nosso WhatsApp no telefone (11) 95945-6115.</p><br>
            <p>Agradecemos por confiar em nosso sistema e esperamos continuar atendendo às suas necessidades em atendimento ao cliente.</p>
            <p>Atenciosamente,<br>Equipe de Suporte</p><br>
            <p><strong>*NÃO RESPONDA ESSA MENSAGEM AUTOMÁTICA, NOSSO NÚMERO DE ATENDIMENTO É O (11) 95945-6115.*</strong></p>
          </div>`
                    };
                    await (0, SendMail_1.SendMail)(_email);
                }
                else if (Math.round(dias) === 3) {
                    const _email = {
                        to: c.email,
                        subject: `Sua mensalidade no WHATSAPP - Outlet das Tintas vence em 3 dias`,
                        text: `<div style="background-color: #f7f7f7; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <p>Prezado(a) cliente,</p>
            <p>Gostaríamos de lembrar que sua mensalidade no WHATSAPP - Outlet das Tintas está prestes a vencer em 3 dias (${vencimento}). Agradecemos por confiar em nossa plataforma de multiatendimento com chatbot para WhatsApp, e esperamos que ela esteja sendo útil para o seu negócio.</p>
            <p>Para garantir a continuidade dos serviços prestados pela nossa plataforma, pedimos que realize o pagamento da fatura na tela “Financeiro” na área de “Administração” dentro da plataforma.</p>
            <p>Se precisar de ajuda ou tiver alguma dúvida durante a utilização da plataforma, não hesite em entrar em contato conosco através do nosso WhatsApp no telefone (11) 95945-6115.</p><br>
            <p>Agradecemos por escolher o WHATSAPP - Outlet das Tintas e esperamos continuar atendendo às suas necessidades em atendimento ao cliente.</p>
            <p>Atenciosamente,<br>Equipe de Suporte</p><br>
            <p><strong>*NÃO RESPONDA ESSA MENSAGEM AUTOMÁTICA, NOSSO NÚMERO DE ATENDIMENTO É O (11) 95945-6115.*</strong></p>
          </div>`
                    };
                    await (0, SendMail_1.SendMail)(_email);
                }
                else if (Math.round(dias) === 1) {
                    const _email = {
                        to: c.email,
                        subject: `Importante - Sua mensalidade no WHATSAPP - Outlet das Tintas venceu hoje`,
                        text: `<div style="background-color: #f7f7f7; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <p>Prezado(a) cliente,</p>
            <p>Gostaríamos de lembrar que sua mensalidade no WHATSAPP - Outlet das Tintas venceu hoje (${vencimento}). Agradecemos por confiar em nossa plataforma de multiatendimento com chatbot para WhatsApp, e esperamos que ela esteja sendo útil para o seu negócio.</p>
            <p>Para continuar a utilizar nossos serviços, pedimos que realize o pagamento na tela “Financeiro” o mais breve possível. Em caso de dúvidas ou para mais informações sobre como realizar o pagamento da fatura, entre em contato conosco através do nosso WhatsApp no telefone (11) 95945-6115.</p><br>
            <p>Atenciosamente,<br>Equipe de Suporte</p><br>
            <p><strong>*NÃO RESPONDA ESSA MENSAGEM AUTOMÁTICA, NOSSO NÚMERO DE ATENDIMENTO É O (11) 95945-6115.*</strong></p>
          </div>`
                    };
                    await (0, SendMail_1.SendMail)(_email);
                }
            }
        }
        catch (error) {
            console.log('Não consegui enviar o email');
        }
    });
};
exports.sendEmailDueDate = sendEmailDueDate;
