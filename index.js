'use strict';

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const request = require('request-promise');

let api_v = 'v2.9';

let urler = ({ base_url, edge, fields = '', params = {}, token }) => {
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
    console.log(url);
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

let pageRequest = async(({ base_url, edge, fields, params, pages, token }) => {
    let page = 0;
    let responses = [];
    let url = urler({base_url, edge, fields, params, token});

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

        this.fb_access_token = config.token;
        this.api_v = config.api || api_v;
        this.base_url = `https://graph.facebook.com/${this.api_v}/`;
    }
    test () {
        console.log(this.fb_access_token);
    }
    setToken (token) {
        if (typeof token !== 'string') {
            throw new Error(`Token must be a string`);
        }

        this.fb_access_token = token;
        return this.fb_access_token;
    }

    post ({ edge, fields, params, token = this.fb_access_token }) {
        return processRequest({method: 'POST', url: urler({base_url: this.base_url, edge, fields, params, token})});
    }

    get ({ edge, fields, params, token = this.fb_access_token }) {
        return processRequest({method: 'GET', url: urler({base_url: this.base_url, edge, fields, params, token})});
    }

    delete ({ edge, token = this.fb_access_token }) {
        return processRequest({method: 'DELETE', url: urler({base_url: this.base_url, edge, token})});
    }

    page ({ edge, fields, params, pages, token = this.fb_access_token }) {
        return async((() => {
            return await(pageRequest({base_url: this.base_url, edge, fields, params, pages, token}));
        }))();
    }
};

module.exports = {
    FbRequest
};
