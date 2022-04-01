import * as state from './state';
import { processMessages } from './processMessages';
import * as log from './log';

log.info('Init');

export async function handler() {
    log.info('Starting lambda processMessage');
    await state.initState();
    await processMessages();
    console.log('finished');
}
