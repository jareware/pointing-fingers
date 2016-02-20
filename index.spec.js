const assert = require('chai').assert; // @see http://chaijs.com/api/assert/
const checkUpstreamApis = require('./index').checkUpstreamApis;

describe('pointing-fingers', () => {

  it('works', () => {
    assert.deepEqual(checkUpstreamApis({}), {}); // TODO
  });

});
