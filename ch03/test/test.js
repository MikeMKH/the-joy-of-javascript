var assert = require('assert');

describe('3.1', function() {
  it('should print "Something, Something, Something, Dark Side"', function() {
    var s = 'Something, Something, Something, Dark Side';
    function foo() { return s; }
    assert.equal(foo(), s);
  });
});