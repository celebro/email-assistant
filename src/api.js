import fetch from 'node-fetch';
import jsdom from 'jsdom';

import { state, updateState } from './state.js';
import config from './config.js';
import * as log from './log.js';

const urlBase = 'https://vrtec.easistent.com';
const urls = {
    login: `${urlBase}/login`,
    feed: `${urlBase}/parent/feed/month`
};

export async function getAllItems() {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;

    const currentMonthResponse = await makeRequest(`${urls.feed}/${year}/${month}`);
    const currentJson = await currentMonthResponse.json();

    date.setMonth(month - 2);
    year = date.getFullYear();
    month = date.getMonth() + 1;

    const lastMonthResponse = await makeRequest(`${urls.feed}/${year}/${month}`);
    const lastJson = await lastMonthResponse.json();

    return [...currentJson.items, ...lastJson.items];
}

async function makeRequest(url) {
    let session = state.session;
    if (!session) {
        session = await login();
    }

    log.info('fetch', url);
    let response = await fetch(url, {
        headers: {
            cookie: session
        },
        redirect: 'manual'
    });

    if (!response.ok) {
        session = await login();
        log.info('fetch', url);
        response = await fetch(url, {
            headers: {
                cookie: session
            },
            redirect: 'manual'
        });
    }

    if (response.ok) {
        updateState(s => {
            s.session = getSessionCookie(response);
        });

        return response;
    } else {
        throw new Error('Failed to make request ' + url);
    }
}

async function login() {
    log.info('login');
    const { token, session } = await getLoginToken();

    const params = new URLSearchParams();
    params.append('_token', token);
    params.append('username', config.username);
    params.append('password', config.password);

    const loginResponse = await fetch('https://vrtec.easistent.com/login', {
        method: 'POST',
        headers: {
            // authority: 'vrtec.easistent.com',
            // 'cache-control': 'max-age=0',
            // origin: 'https://vrtec.easistent.com',
            // 'upgrade-insecure-requests': '1',
            // dnt: '1',
            // 'content-type': 'application/x-www-form-urlencoded',
            // 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
            // 'sec-fetch-user': '?1',
            // accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            // 'sec-fetch-site': 'same-origin',
            // 'sec-fetch-mode': 'navigate',
            // referer: 'https://vrtec.easistent.com/login',
            // 'accept-encoding': 'gzip, deflate, br',
            // 'accept-language': 'sl,en-US;q=0.9,en;q=0.8,sl-SI;q=0.7',
            cookie: `${session}`
        },
        body: params,
        redirect: 'manual'
    });

    const cookie = getSessionCookie(loginResponse);

    return cookie;
}

async function getLoginToken() {
    const response = await fetch(urls.login);
    const html = await response.text();
    const dom = new jsdom.JSDOM(html);

    const document = dom.window.document;
    const input = document.querySelector('input[name="_token"]');
    const token = input.getAttribute('value');

    const session = getSessionCookie(response);
    return { token, session };
}

function getSessionCookie(response) {
    const setCookie = response.headers.raw()['set-cookie'][0];
    const cookie = setCookie.split(';')[0];
    return cookie;
}
