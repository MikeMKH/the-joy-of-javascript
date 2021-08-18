var assert = require('assert');

describe('3.1', function() {
  const UpperCaseFormatter = {
    format: function(str) {
      return str.toUpperCase();
    }
  };
  it('implicit link, is-a', function() {
    // Foo is-a UpperCaseFormatter
    const Foo = Object.create(UpperCaseFormatter);
    Foo.say = function say(msg) {
      return this.format(msg);
    };
    assert.equal(Foo.say("hello"), "HELLO");
  }),
  it('explicit link, has-a', function() {
    // Foo has-a UpperCaseFormatter
    const Foo = {
      formatter: UpperCaseFormatter,
      say: function say(msg) {
        return this.formatter !== null
        ? this.formatter.format(msg)
        : msg;
      }
    };
    assert.equal(Foo.say("hello"), "HELLO");
  });
});