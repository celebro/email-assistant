import { getAllItems } from './api.js';
import { state, updateState } from './state.js';
import { sendEmail, testEmail } from './email.js';
import * as log from './log.js';

main();
// testEmail();

async function main(params) {
    while (true) {
        log.info('Starting loop');
        try {
            await processFeed();
        } catch (e) {
            log.error(e);
        }

        await wait(3 * 60 * 1000);
    }
}

async function processFeed() {
    const items = await getAllItems();
    log.info(`Fetched ${items.length} items`);
    // console.log(JSON.stringify(items, null, 2));

    const lastSyncDate = state.lastSyncDate;
    const lastSyncId = state.lastSyncId;

    let syncDate, syncId;
    const messagesToSend = [];

    for (const item of items) {
        if (item.type !== 'message') {
            continue;
        }

        const message = item.message;
        if (syncDate === undefined) {
            syncDate = item.date;
            syncId = message.id;
            if (!lastSyncDate) {
                log.info('Initial fetch, only store timestamp');
                break;
            }
        }

        if (item.date < lastSyncDate || message.id === lastSyncId) {
            break; // Already processed
        }

        messagesToSend.push(message);
    }

    log.info(`Found ${messagesToSend.length} new messages`);

    if (messagesToSend.length > 0) {
        messagesToSend.reverse();
        // console.log(JSON.stringify(messagesToSend, null, 2));
        sendEmail(messagesToSend);
    }

    if (syncDate) {
        log.info(`Updating sync state ${syncDate} /  ${syncId}`);
        updateState(s => {
            s.lastSyncDate = syncDate;
            s.lastSyncId = syncId;
        });
    }
}

function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
