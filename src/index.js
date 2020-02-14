import { getAllItems } from "./api.js";
import { state, updateState } from "./state.js";

processFeed();

async function processFeed() {
    const items = await getAllItems();
    // console.log(JSON.stringify(items, null, 2));

    const lastSyncDate = state.lastSyncDate;
    const lastSyncId = state.lastSyncId;

    let syncDate, syncId;
    const messagesToSend = [];

    for (const item of items) {
        if (item.type !== "message") {
            continue;
        }

        const message = item.message;
        if (syncDate === undefined) {
            syncDate = item.date;
            syncId = message.id;
            if (!lastSyncDate) {
                break;
            }
        }

        if (item.date < lastSyncDate || message.id === lastSyncId) {
            break; // Already processed
        }

        messagesToSend.push(message);
    }

    console.log(messagesToSend.length);
    if (messagesToSend.length > 0) {
        console.log(JSON.stringify(messagesToSend, null, 2));
    }

    if (syncDate) {
        // updateState(s => {
        //     s.lastSyncDate = syncDate;
        //     s.lastSyncId = syncId;
        // });
    }
}
