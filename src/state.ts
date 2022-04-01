import * as fs from 'fs';
import { resolve } from 'path';
import * as Dynamo from '@aws-sdk/client-dynamodb';
import * as DynamoLib from '@aws-sdk/lib-dynamodb';
import produce from 'immer';

import * as log from './log';
import config from './config';

interface State {
    session?: string;
    lastSyncDate?: string;
    lastSyncId?: number;
}
export let state: State = {};

let statePromise: Promise<void> | undefined = undefined;
export async function initState() {
    if (!statePromise) {
        statePromise = readState();
    }
    return statePromise;
}

let timeout: NodeJS.Timeout | undefined = undefined;
/**
 *
 * @param {(Object) => void} updater
 */
export function updateState(updater: (s: State) => void) {
    const oldState = state;
    state = produce(state, updater);
}

// import { fileURLToPath } from 'url';
// import { dirname, resolve } from 'path';
// const localStateDirectory = dirname(fileURLToPath(import.meta.url));
const localStateDirectory = __dirname;
const localStatePath = resolve(localStateDirectory, '../state.json');

const options: Dynamo.DynamoDBClientConfig = {};
if (process.env.IS_LOCAL || process.env.IS_OFFLINE) {
    Object.assign(options, {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
    });
}
const dynamoBaseClient = new Dynamo.DynamoDBClient(options);
const dynamoDocClient = DynamoLib.DynamoDBDocumentClient.from(dynamoBaseClient);

async function readState() {
    if (config.inAws) {
        log.info('Reading state from Dynamo');
        const getCommand = new DynamoLib.GetCommand({
            TableName: config.tableName,
            Key: {
                PK: 'state',
            },
        });
        const result = await dynamoDocClient.send(getCommand);
        state = (result.Item as State) || { PK: 'state' };
        state = produce(state, (s) => {});
    } else {
        log.info('Reading state from local file ', localStatePath);
        try {
            const fileContent = fs.readFileSync(localStatePath, 'utf8');
            state = JSON.parse(fileContent);
            state = produce(state, (s) => {});
        } catch (error: any) {
            state = {};
            if (error.code == 'ENOENT') {
                // File does not exist
                log.warn('Creating new state file, no already published content will be synced');
            } else {
                log.error(error);
            }
        }
    }
    dbState = state;
}

let dbState: State | undefined;
export async function saveState() {
    log.info('Persisting state', JSON.stringify(state));
    if (state !== dbState && Object.keys(state).length > 0) {
        try {
            if (config.inAws) {
                log.info('Writing state to dynamo');
                const putCommand = new DynamoLib.PutCommand({
                    TableName: config.tableName,
                    Item: state,
                });
                await dynamoDocClient.send(putCommand);
            } else {
                log.info('Writing state to file');
                fs.promises.writeFile(localStatePath, JSON.stringify(state, null, 4));
            }
        } catch (err: any) {
            log.error('Failed to persist state', err);
        }
    } else {
        log.info('No change in state');
    }
}
