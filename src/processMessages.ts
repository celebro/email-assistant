import { getAllItems } from './api';
import { state, updateState, saveState } from './state';
import { sendEmail } from './email';
import * as log from './log';

export async function processMessages() {
    try {
        await processMessagesInternal();
    } finally {
        await saveState();
    }
}

async function processMessagesInternal() {
    log.info('Processing messages');

    const items = await getAllItems();
    const lastSyncDate = state.lastSyncDate || '';
    const lastSyncId = state.lastSyncId;

    log.info(`Fetched ${items.length} items, will update newer from ${lastSyncDate} / ${lastSyncId}`);
    // console.log(JSON.stringify(items, null, 2));

    let syncDate: string | undefined;
    let syncId: number | undefined;
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
        await sendEmail(messagesToSend);
    }

    if (syncDate) {
        log.info(`Updating sync state ${syncDate} / ${syncId}`);
        updateState((s) => {
            s.lastSyncDate = syncDate;
            s.lastSyncId = syncId;
        });
    }
}
