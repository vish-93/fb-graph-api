'use strict';

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const request = require('request-promise');

let fb_access_token;
let api_v = 'v2.9';
let base_url;

let urler = ({edge, fields = '', params = {}, token = fb_access_token }) => {
    let param_string = '',
        url = `${base_url}${edge}?fields=${fields}&access_token=${token}`;

    for (let prop in params) {
        if (params.hasOwnProperty(prop)) {
            if (typeof params[prop] === 'string') {
                param_string += `&${prop}=${params[prop]}`;
            } else {
                param_string += `&${prop}=${JSON.stringify(params[prop])}`;
            }
        }
    }
    url += param_string;

    return url;
};

let processRequest = async(({ method, url }) => {
    try {
        return await(request({method, url, json: true}));
    } catch (err) {
        if (typeof err !== 'string') {
            err = !!err.error ? err.error : err;
            err = !!err.error ? err.error : err;
            err = !!err.message ? err.message : err;
        }

        let error = new Error(err);
        error.url = url;
        throw error;
    }
});

let pageRequest = async(({ edge, fields, params, pages, token }) => {
    let page = 0;
    let responses = [];
    let url = urler({edge, fields, params, token});

    while (!!url) {
        if (!!pages) {
            page++;
        }
        let result = await(processRequest({method: 'GET', url}));
        if (!result.data) {
            result = result[Object.keys(result)[0]];
        }

        url = !!result.paging && !!result.paging.next ? result.paging.next : null;
        responses = responses.concat(result.data);
        if (!!page && +pages === page) {
            break;
        }
    }

    return responses;
});

class FbRequest {
    constructor (config) {
        if (!config) {
            config = {};
        }

        fb_access_token = config.token;
        api_v = config.api || api_v;
        base_url = `https://graph.facebook.com/${api_v}/`;
    }

    post ({ edge, fields, params, token }) {
        return processRequest({method: 'POST', url: urler({edge, fields, params, token})});
    }

    get ({ edge, fields, params, token }) {
        return processRequest({method: 'GET', url: urler({edge, fields, params, token})});
    }

    delete ({ edge, token }) {
        return processRequest({method: 'DELETE', url: urler({edge, token})});
    }

    page ({ edge, fields, params, pages, token }) {
        return async((() => {
            return await(pageRequest({edge, fields, params, pages, token}));
        }))();
    }
};

module.exports = {
    FbRequest
};
