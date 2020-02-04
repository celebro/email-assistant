import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import immer from 'immer';

// @ts-ignore

const produce = immer.produce;

const stateDirectory = dirname(fileURLToPath(import.meta.url));
const statePath = resolve(stateDirectory, '../data/state.json');

/** @type Object */
export let state = null;

try {
    const fileContent = fs.readFileSync(statePath, 'utf8');
    state = JSON.parse(fileContent);
} catch (error) {
    state = {};
    if (error.code == 'ENOENT') {
        // File does not exist
        console.warn('Creating new state file, no already published content will be synced');
    } else {
        console.error(error);
    }
}

let timeout = null;

function saveState() {
    fs.writeFile(statePath, JSON.stringify(state, null, 4), err => {
        if (err) {
            console.error('err');
        }
    });
}

/**
 *
 * @param {(Object) => void} updater
 */
export function updateState(updater) {
    const oldState = state;
    state = produce(state, updater);
    if (state !== oldState && !timeout) {
        timeout = setTimeout(() => {
            timeout = null;
            saveState();
        }, 5000);
    }
}
