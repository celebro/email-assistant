import config from './config';

export function info(...args: any[]) {
    if (config.logLevel >= 2) {
        console.info(preamble(), ...args);
    }
}

export function warn(...args: any[]) {
    if (config.logLevel >= 1) {
        console.warn(preamble(), ...args);
    }
}

export function error(...args: any[]) {
    console.error(preamble(), ...args);
}

function preamble() {
    return `${new Date().toISOString()} --`;
}
