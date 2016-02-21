const assert = require('chai').assert; // @see http://chaijs.com/api/assert/
const testUpstreamChanges = require('./index').testUpstreamChanges;

describe('pointing-fingers', () => {

  it('works without mocha integration', () => {
    return testUpstreamChanges({
      learn: false,
      fixtures: 'fixtures/',
      urls: [
        'https://api.github.com/user'
      ],
      ignores: [
        'headers'
      ]
    });
  });

  describe('mocha integration', () => {

    testUpstreamChanges({
      learn: false,
      fixtures: 'fixtures/',
      runner: it,
      assert: assert.deepEqual,
      urls: [
        'https://api.github.com/user'
      ],
      ignores: [
        'headers'
      ]
    });

  });

  describe('more exotic options', () => {

    testUpstreamChanges({
      learn: false,
      fixtures: 'fixtures/',
      runner: it,
      assert: assert.deepEqual,
      base: 'https://api.github.com',
      urls: [
        '/user',
        '/orgs/futurice',
        {
          url: '/users/jareware',
          ignores: [
            'data.updated_at',
            'headers'
          ]
        }
      ],
      placeholder: 'IGNORED IN TEST SUITE',
      ignores: [
        'headers.date',
        'headers.last-modified',
        'headers.etag',
        [ 'headers', 'x-github-request-id' ],
        [ 'headers', 'x-served-by' ],
        [ 'headers', 'x-ratelimit-reset' ]
      ],
      transforms: [
        res => res.headers['x-ratelimit-remaining'] = !!res.headers['x-ratelimit-remaining'].match(/^\d+$/)
      ]
    });

  });

});
