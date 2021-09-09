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

describe('5.1', function() {
  describe('applyIfNotNull', function() {
    const applyIfNotNull = curry((fn, data) =>
      (data != null)
      ? fn(data)
      : data);
      
    it('should apply function when value is not null', function() {
      const add1 = x => x + 1;
      const safeAdd1 = applyIfNotNull(add1);
      
      assert.equal(safeAdd1(1), 2);
      assert.equal(safeAdd1(101), 102);
    }),
    it('should not apply function when value is null', function() {
      let wasCalled = false;
      const spy = function() { wasCalled = true; }
      const sut = applyIfNotNull(spy);
      
      sut(null);
      assert.equal(wasCalled, false);
      sut(undefined);
      assert.equal(wasCalled, false);
    });
  }),
  describe('Array as a box', function() {
    it('should chain', function() {
      const unique = letters => Array.from(new Set(letters));
      const join = arr => arr.join('');
      const toUpper = str => str.toUpperCase();
      
      const result = Array.of('Mike Harris')
        .map(unique)
        .map(join)
        .map(toUpper)
        .pop();
      assert.equal(result, 'MIKE HARS');
    });
  }),
  describe('Id', function() {
    class Id extends Array {
      constructor(value) {
        super(1);
        this.fill(value);
      }
    }
    it('should chain', function() {
      const unique = letters => Array.from(new Set(letters));
      const join = arr => arr.join('');
      const toUpper = str => str.toUpperCase();
      
      const result = Id.of('Mike Harris')
        .map(unique)
        .map(join)
        .map(toUpper)
        .pop();
      assert.equal(result, 'MIKE HARS');
    });
  });
});