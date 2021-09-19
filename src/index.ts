import * as log from './log';
import { processMessages } from './processMessages';

mainLoop();

async function mainLoop() {
    log.info('Starting loop');
    try {
        await processMessages();
    } catch (e) {
        log.error(e);
    }

    if (mainLoopTimeout !== undefined) {
        mainLoopTimeout = setTimeout(mainLoop, 3 * 60 * 1000);
    }
}

let mainLoopTimeout: NodeJS.Timeout | undefined = undefined;
function gracefullShutdown() {
    if (mainLoopTimeout) {
        clearTimeout(mainLoopTimeout);
        mainLoopTimeout = undefined;
    }
}

process.once('SIGTERM', () => {
    log.info('SIGTERM');
    gracefullShutdown();
});

process.once('SIGINT', function (code) {
    log.info('SIGINT');
    gracefullShutdown();
});
