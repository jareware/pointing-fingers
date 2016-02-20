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

});
