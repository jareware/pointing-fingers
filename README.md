# pointing-fingers

Simple tool for tracking changes to an upstream API as part of your test suite.

## Wait but why?

Software doesn't exist in a vacuum, and many apps depend on one or more upstream API's. If those API's suddenly change, your app breaks. Still, it rarely makes sense to write comprehensive unit tests for upstream API's - budgets are finite, after all.

This tool offers a sensible middle ground, and a convenient workflow for:

 * **Documenting the upstream API format**, as not all API's are perfectly documented
 * **Versioning that documentation**, as API's tend to change over time
 * **Automatically alerting you to API changes**, as sometimes upstream vendors won't
 * **Explicitly accepting those API changes**, as your app will likely need to be changed accordingly

## Installation

```
$ npm install --save-dev pointing-fingers
```

## Example

This is an example Mocha test that uses all available options (though none are mandatory):

```js
/* eslint-env mocha */

import { assert } from 'chai'; // @see http://chaijs.com/api/assert/
import { testUpstreamChanges } from 'pointing-fingers'; // @see https://github.com/jareware/pointing-fingers

describe('GitHub API', () => {

  testUpstreamChanges({
    learn: false, // turn this on to update your fixtures (defaults to false)
    fixtures: 'test/fixtures/', // fixtures will be written here (defaults to "/dev/null")
    runner: it, // run each test in a separate Mocha it() block (defaults to running everything together)
    assert: assert.deepEqual, // which assert(actual, expected) to use (defaults to simple string comparison)
    placeholder: '(IGNORED IN TEST SUITE)', // ignored fields are replaced with this (defaults to null)
    ignores: [ // these are simply delegated to lodash's _.set() (defaults to [])
      'data.documentation_url', // we don't care if the doc URL changes, so ignore that field
      'headers.content-length', // this could also change spontaneously, and we're not interested
      'headers.date' // ^ ditto
    ],
    transforms: [ // these are invoked with the response object to allow arbitrary checks/ignores (defaults to [])
      res => res.status = (res.status >= 400 && res.status < 500) // ensure it's 4xx, but tolerate small changes
      /*
      // transforms which throw an Error are ignored, so it's safe to traverse/iterate complex objects without
      // littering the transform function with key existence checks. also, the res object is always an isolated
      // clone, so in-place mutation is fine.
      res => res.data.Teams.forEach(x => x.TeamRankingPoints = isNumber(x.TeamRankingPoints)),
      */
    ],
    headers: { // these are attached to outgoing requests (defaults to {})
      'X-Api-Key': process.env.MY_SECRET_KEY
    },
    method: 'GET', // (defaults to "GET")
    base: 'https://api.github.com', // all URL's are prefixed with this (defaults to "")
    urls: [ // these are the actual URL's that will be tested (defaults to [])
      '/user' // the URL's can be listed as simple strings
      /*
      { // ...but also as objects
        url: '/something-else',
        headers: { // all options (ignores, transforms, etc) can be overridden per-URL
          'X-Api-Key': 'some other key'
        }
      }
      */
    ]
  });
  
});
```

Running this test will request `GET https://api.github.com/user`, which yields the following raw response object (some headers are omitted for brevity):

```json
{
  "data": {
    "documentation_url": "https://developer.github.com/v3",
    "message": "Requires authentication"
  },
  "headers": {
    "access-control-allow-origin": "*",
    "connection": "close",
    "content-length": "91",
    "content-type": "application/json; charset=utf-8",
    "date": "Sun, 21 Feb 2016 10:50:27 GMT",
    "server": "GitHub.com"
  },
  "status": 401,
  "statusText": "Unauthorized"
}
```

By setting `learn: true`, the following file will be written to `./test/fixtures/user.json` (object properties are sorted to make stringification stable between runs):

```json
{
  "data": {
    "documentation_url": "(IGNORED IN TEST SUITE)",
    "message": "Requires authentication"
  },
  "headers": {
    "access-control-allow-origin": "*",
    "connection": "close",
    "content-length": "(IGNORED IN TEST SUITE)",
    "content-type": "application/json; charset=utf-8",
    "date": "(IGNORED IN TEST SUITE)",
    "server": "GitHub.com"
  },
  "status": true,
  "statusText": "Unauthorized"
}
```

Then, you can set `learn: false`, commit your test file and JSON fixtures to version control, and run your test suite:

![mocha-success](mocha-success.png)

It's especially useful to have your CI server run these tests periodically, e.g. nightly, because upstream API's can change even if you haven't pushed code in a while.

If at some point in the future GitHub suddenly changes their API, you'll be notified with:

![mocha-failure](mocha-failure.png)

This should give you an idea of what parts of your application you should check for compatibility with the upstream API changes. Once you're done, set `learn: true`, re-run the test suite, set `learn: false`, commit changed fixtures to version control, and you're back to:

![mocha-success](mocha-success.png)

## Licence

[MIT](https://opensource.org/licenses/MIT)

## Acknowledgements

[![chilicorn](chilicorn.png)](http://futurice.com/blog/sponsoring-free-time-open-source-activities)
