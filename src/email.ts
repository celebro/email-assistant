import * as SES from '@aws-sdk/client-ses';
// import * as nodemailer from 'nodemailer';
import config from './config';
import * as log from './log';

// https://aws.amazon.com/premiumsupport/knowledge-center/lambda-send-email-ses/
// https://medium.com/appgambit/serverless-email-service-with-aws-ses-and-templates-139f56cf539c

const sesClient = new SES.SESClient({});

export async function sendEmail(messages: any) {
    // const transporter = nodemailer.createTransport(config.emailServer);
    // const info = await transporter.sendMail({
    //     from: config.emailFrom,
    //     to: config.emailTo,
    //     subject: message.subject,
    //     html: html,
    // });

    for (const message of messages) {
        const html = `
        <div style="background-color:#f2f2f2;font-family:arial;color:#666666">
            <div style="padding:10px;margin:0;background-color:#ee984f;color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold">
                <div style="margin:0 auto;width:80%">
                    <b style="font-size:20px">Email assistant</b><b style="font-weight:lighter;font-size:20px"> | </b><b style="font-weight:lighter;font-size:16px">za vrtce</b>
                </div>
            </div>

            <div style="padding: 8px">
                <p style="margin-top: 0">
                    <b>≡</b> ${getSenderName(message.sender)}<br />
                    <b>≡</b> ${message.created_at}
                </p>

                ${message.content}
            </div>
        </div>
        `;

        log.info('Sending email', message.subject);
        const sendEmailCommand = new SES.SendEmailCommand({
            Source: config.emailFrom,
            Destination: {
                ToAddresses: config.emailTo.split(','),
            },
            Message: {
                Subject: { Data: message.subject },
                Body: {
                    Html: { Data: html },
                },
            },
        });
        await sesClient.send(sendEmailCommand);
    }
}

function delay(timeout: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}

function getSenderName(sender: any) {
    return [sender.name, sender.middle_name, sender.surname].filter(Boolean).join(' ');
}

export function testEmail() {
    const messages = [
        {
            sender: {
                gender: 'F',
                name: 'Test',
                surname: 'User',
            },
            created_at: new Date().toISOString(),
            content: 'Hello world',
        },
    ];
    return sendEmail(messages);
}
