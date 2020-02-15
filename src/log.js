import config from './config.js';

export function info(...args) {
    if (config.logLevel >= 2) {
        console.info(preamble(), ...args);
    }
}

export function warn(...args) {
    if (config.logLevel >= 1) {
        console.warn(preamble(), ...args);
    }
}

export function error(...args) {
    console.error(preamble(), ...args);
}

function preamble() {
    return `${new Date().toISOString()} --`;
}
