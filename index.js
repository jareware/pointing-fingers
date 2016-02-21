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

var defaults = {
  urls: [],
  runner: defaultRunner,
  base: '',
  method: 'GET',
  headers: {},
  ignores: [],
  placeholder: null,
  transforms: [],
  learn: false,
  assert: defaultAssert,
  fixtures: '/dev/null/'
};

function testUpstreamChanges(options) {

  return Promise.all((options.urls || []).map(function(url) {

    return opt('runner')(opt('url'), function() {
      return axios({
        url: opt('base') + opt('url'),
        method: opt('method'),
        headers: opt('headers')
      }).then(test, test);
    });

    function opt(name) {
      if (name === 'url' && _.isString(url)) return url;
      if (url[name]) return url[name];
      if (options[name]) return options[name];
      return defaults[name];
    }

    function test(res) {

      var actual = _.omit(res, 'config');

      opt('ignores').forEach(function(ignore) {
        if (_.has(actual, ignore)) {
          _.set(actual, ignore, opt('placeholder'));
        }
      });

      opt('transforms').forEach(function(transform) {
        try {
          transform(res);
        } catch (e) {}
      });

      if (opt('learn')) {
        fs.writeFileSync(filename(opt('url')), toString(actual));
      } else {
        var expected = JSON.parse(fs.readFileSync(filename(opt('url'))));
        opt('assert')(actual, expected);
      }

    }

    function filename(url) {
      return opt('fixtures')
        + url
          .replace(/^\//, '')
          .replace(/[^a-zA-Z0-9-]/g, '_')
          .replace(/_+/g, '_')
        + '.json';
    }

  }));

}
