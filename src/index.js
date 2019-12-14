import fetch from 'node-fetch';
import jsdom from 'jsdom';

import module from 'module';
const require = module.createRequire(import.meta.url);
const config = require('../config.json');

const urlBase = 'https://vrtec.easistent.com';
const urls = {
    login: `${urlBase}/login`,
    feed: `${urlBase}/parent/feed/month`
};

function getSessionCookie(response) {
    const setCookie = response.headers.raw()['set-cookie'][0];
    const cookie = setCookie.split(';')[0];
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

async function login() {
    const { token, session } = await getLoginToken();

    const params = new URLSearchParams();
    params.append('_token', token);
    params.append('username', config.username);
    params.append('password', config.password);

    const loginResponse = await fetch('https://vrtec.easistent.com/login', {
        method: 'POST',
        headers: {
            authority: 'vrtec.easistent.com',
            'cache-control': 'max-age=0',
            origin: 'https://vrtec.easistent.com',
            'upgrade-insecure-requests': '1',
            dnt: '1',
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
            'sec-fetch-user': '?1',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'navigate',
            referer: 'https://vrtec.easistent.com/login',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'sl,en-US;q=0.9,en;q=0.8,sl-SI;q=0.7',
            cookie: `${session}`
        },
        body: params,
        redirect: 'manual'
    });

    // debugger;

    // if (loginResponse.ok) {
    // console.log(loginResponse.headers.raw());
    // console.log(JSON.stringify(loginResponse.headers.raw(), null, 2));
    // const setCookie = loginResponse.headers.raw()['set-cookie'][0];
    // console.log(setCookie);
    // const cookie = setCookie.split(';')[0];

    // // console.log(params.toString());
    console.log(await loginResponse.text());
    // process.exit();

    const cookie = getSessionCookie(loginResponse);

    return cookie;
    // } else {
    // throw new Error('Login request failed');
    // }
}

async function processFeed() {
    const session = await login();
    console.log('######', session);

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const feedResponse = await fetch(`${urls.feed}/${year}/${month}`, {
        headers: {
            cookie: session
        }
    });
    // const feed = await feedResponse.json();

    console.log(await feedResponse.text());
    debugger;
    // console.log(await feedResponse.json());
    // date.setMonth(month - 2);
    // cons
    // const lastMonth = date.mont
}

async function becauseNodeCantTopLevelAwait() {
    await processFeed();
}
becauseNodeCantTopLevelAwait();
