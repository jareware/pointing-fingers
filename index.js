var axios = require('axios');
var fs = require('fs');
var _ = require('lodash');
var stringify = require('json-stable-stringify');

module.exports = {
  testUpstreamChanges: testUpstreamChanges
};

function toString(x) {
  return stringify(x, { space: '    ' });
}

function defaultRunner(description, callback) {
  return callback();
}

function defaultAssert(actual, expected) {
  var act = toString(actual);
  if (act !== toString(expected)) {
    throw new Error('Fixture mismatch, actual: ' + act);
  }
}

function testUpstreamChanges(opt) {

  return Promise.all((opt.urls || []).map(function(url) {

    return (opt.runner || defaultRunner)(url, function() {
      return axios({
        url: (opt.base || '') + url,
        method: opt.method || 'GET',
        headers: opt.headers || {}
      }).then(test, test);
    });

    function test(res) {

      var actual = _.omit(res, 'config');

      (opt.ignores || []).forEach(function(ignore) {
        if (_.has(actual, ignore)) {
          _.set(actual, ignore, opt.placeholder || null);
        }
      });

      (opt.transforms || []).forEach(function(transform) {
        try {
          transform(res);
        } catch (e) {}
      });

      if (opt.learn) {
        fs.writeFileSync(filename(url), toString(actual));
      } else {
        var expected = JSON.parse(fs.readFileSync(filename(url)));
        (opt.assert || defaultAssert)(actual, expected);
      }

    }

    function filename(url) {
      return (opt.fixtures || '/dev/null/')
        + url
          .replace(/^\//, '')
          .replace(/[^a-zA-Z0-9]/g, '_')
          .replace(/_+/g, '_')
        + '.json';
    }

  }));

}
