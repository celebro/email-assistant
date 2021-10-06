import fetch, { Response } from 'node-fetch';
import cheerio from 'cheerio';

import { state, updateState } from './state';
import config from './config';
import * as log from './log';

const urlBase = 'https://vrtec.easistent.com';
const urls = {
    login: `${urlBase}/login`,
    feed: `${urlBase}/parent/feed/month`,
};

export async function getAllItems() {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;

    const currentMonthRequest = makeRequest(`${urls.feed}/${year}/${month}`);
    date.setMonth(month - 2);
    year = date.getFullYear();
    month = date.getMonth() + 1;
    const lastMonthRequest = makeRequest(`${urls.feed}/${year}/${month}`);

    const currentMonthResponse = await currentMonthRequest;
    const currentJson: any = await currentMonthResponse.json();

    const lastMonthResponse = await lastMonthRequest;
    const lastJson: any = await lastMonthResponse.json();

    return [...currentJson.items, ...lastJson.items];
}

async function makeRequest(url: string) {
    let session = state.session;
    if (!session) {
        session = await login();
    }

    log.info('fetch', url);
    let response = await fetch(url, {
        headers: {
            cookie: session,
        },
        redirect: 'manual',
    });

    if (!response.ok) {
        session = await login();
        log.info('fetch', url);
        response = await fetch(url, {
            headers: {
                cookie: session,
            },
            redirect: 'manual',
        });
    }

    if (response.ok) {
        updateState((s) => {
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
    params.append('username', config.easistentUsername);
    params.append('password', config.easistentPassword);

    const loginResponse = await fetch(urls.login, {
        method: 'POST',
        headers: {
            cookie: `${session}`,
        },
        body: params,
        redirect: 'manual',
    });

    const cookie = getSessionCookie(loginResponse);

    return cookie;
}

async function getLoginToken() {
    const response = await fetch(urls.login, {});
    const html = await response.text();
    const $ = cheerio.load(html);

    const input = $('input[name="_token"]');
    const token = input.attr('value');
    if (!token) {
        throw new Error('Failed to acuire login token');
    }

    const session = getSessionCookie(response);
    return { token, session };
}

function getSessionCookie(response: Response): string {
    const setCookie = response.headers.raw()['set-cookie'][0];
    const cookie = setCookie.split(';')[0];
    return cookie;
}
