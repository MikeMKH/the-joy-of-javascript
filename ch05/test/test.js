const { equal } = require('assert');
var assert = require('assert');
const compose2 = (f, g) => (...args) => f(g(...args));
const compose = (...fns) => fns.reduce(compose2);
const pipe = (...fns) => fns.reduceRight(compose2);
const curry = fn => (...args1) =>
args1.length === fn.length
? fn(...args1)
: (...args2) => {
  const args = [...args1, ...args2];
  return args.length >= fn.length
  ? fn(...args)
  : curry(fn)(...args);
};
const filter = curry((f, a) => a.filter(f));
const map = curry((f, a) => a.map(f));
const reduce = curry((f, a) => a.reduce(f));

describe('5.0', function() {
  it('smoke test', function() {
    assert.ok(true == 1)
  });
});