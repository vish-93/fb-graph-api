# fb-graph-api
Makes the FB graph API easy to use

# Usage
## Initialize
`npm install fb-graph-api --save`
```
const { FbRequest } = require('fb-graph-api');
let config = {
    token: '', //optional - FB access_token 
    api: 'v2.9' //optional - defaults to v2.9
};
const fbRequest = new FbRequest(config);
```
* Use a config token if you have a default token for all calls (eg system user)
* Each individual request can override this token with a `token` param

## GET 
```
let data = await(fbRequest.get({
    edge, // required 
    fields, // optional - must be an array of strings ['id','name']
    params, // optional - must be an object { limit: 4 }
    token // required if no default token on initalization ELSE optional - will override the default token
}));
```

## POST 
```
let data = await(fbRequest.post({
    edge, // required 
    params, // required - must be an object { name: 'New Name', email: 'newemail@xyz.com' }
    token // required if no default token on initalization ELSE optional - will override the default token
}));
```

## DELETE 
```
let data = await(fbRequest.delete({
    edge, // required 
    token // required if no default token on initalization ELSE optional - will override the default token
}));
```

## PAGE 
```
let data = await(fbRequest.page({
    edge, // required 
    fields, // optional - must be an array of strings ['id','name']
    params, // optional - must be an object { limit: 4 },
    pages, // optional - max number of pages returned. Defaults to all
    token // required if no default token on initalization ELSE optional - will override the default token
}));
```

## ERRORS
* Errors will return a human readable message from Facebook
* The error object will also contain a url property which has the url of the call that errored for further debugging purposes
