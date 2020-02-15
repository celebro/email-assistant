import nodemailer from 'nodemailer';

import config from './config.js';

export async function sendEmail(messages) {
    const transporter = nodemailer.createTransport(config.emailServer);

    messages.length = 1;

    for (const message of messages) {
        const sender = message.sender;

        const html = `
        <div style="background-color:#f2f2f2;font-family:arial;color:#666666">
            <div style="padding:10px;margin:0;background-color:#ee984f;color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold">
                <div style="margin:0 auto;width:80%">
                    <b style="font-size:20px">eAsistent</b><b style="font-weight:lighter;font-size:20px"> | </b><b style="font-weight:lighter;font-size:16px">za vrtce</b>
                </div>
            </div>

            <div style="padding: 8px">
                <p style="margin-top: 0">
                    <b>≡</b> ${getSenderName(sender)}<br />
                    <b>≡</b> ${message.created_at}
                </p>

                ${message.content}
            </div>
        </div>
        `;

        const info = await transporter.sendMail({
            from: config.emailFrom,
            to: config.emailTo,
            subject: message.subject,
            html: html
        });

        // console.log(JSON.stringify(info, null, 2));
    }
}

function getSenderName(sender) {
    return [sender.name, sender.middle_name, sender.surname].filter(Boolean).join(' ');
}

export function testEmail() {
    const messages = [
        {
            sender: {
                gender: 'F',
                name: 'Test',
                surname: 'User'
            },
            created_at: new Date().toISOString(),
            content: 'Hello world'
        }
    ];
    return sendEmail(messages);
}
