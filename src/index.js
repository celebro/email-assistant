import { getAllItems } from './api.js';
import { state, updateState } from './state.js';
import { sendEmail, testEmail } from './email.js';
import * as log from './log.js';

console.log('test');

mainLoop();
// testEmail();

async function mainLoop(params) {
    log.info('Starting loop');
    try {
        await processFeed();
    } catch (e) {
        log.error(e);
    }

    if (mainLoopTimeout !== -1) {
        mainLoopTimeout = setTimeout(mainLoop, 3 * 60 * 1000);
    }
}

let mainLoopTimeout;
function gracefullShutdown() {
    clearTimeout(mainLoopTimeout);
    mainLoopTimeout = -1;
}

process.once('SIGTERM', () => {
    log.info('SIGTERM');
    gracefullShutdown();
});

process.once('SIGINT', function(code) {
    log.info('SIGINT');
    gracefullShutdown();
});

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
